import sys
import getopt
import unittest
import urllib
import urllib2
import indigo
import indigo_inchi

indigo = indigo.Indigo()
indigo_inchi = indigo_inchi.IndigoInchi(indigo)
indigo.setOption('ignore-stereochemistry-errors', 'true')

base_url = "http://localhost:8080/"

def make_request(request, data, use_post=True):
    global base_url
    data = urllib.urlencode(data) if data is not None else None
    if use_post:
        r = urllib2.urlopen(base_url + '/' + request, data);
    else:
        r = urllib2.urlopen(base_url + '/' + request + ("" if data is None else "?" + data));
    return r

class TestKetcherServerApi(unittest.TestCase):

    def test_knocknock(self):
        r = make_request("knocknock", None, False)
        self.assertEquals(200, r.code)
        self.assertEquals("You are welcome!", r.read().strip())

    def test_layout(self):
        inp = "CCC>>CCN"
        r = make_request("layout", (("smiles", inp),), False)
        self.assertEquals(200, r.code)
        status, rxnfile = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        self.assertEquals(rxnfile[:4], "$RXN")
        smiles = indigo.loadQueryReaction(rxnfile).smiles()
        self.assertEquals(inp, smiles)

    def test_smiles(self):
        inp = "O=C1NC%91=NC2NC=NC=21.[*:1]%91 |$;;;;;;;;;;_R1$|"
        molfile = indigo.loadMolecule(inp).molfile()
        r = make_request("smiles", (("moldata", molfile),))
        self.assertEquals(200, r.code)
        status, smiles = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        self.assertEquals(inp, indigo.loadMolecule(smiles).canonicalSmiles())

    def test_aromatize(self):
        inp = "N1=C(O)C2NC=NC=2N(CCC)C1=O"
        r = make_request("aromatize", (("moldata", inp),))
        self.assertEquals(200, r.code)
        status, molfile = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        smiles = indigo.loadMolecule(molfile).canonicalSmiles()
        self.assertEquals(smiles, "CCCN1C(=O)N=C(O)c2[nH]c[n]c12")

    def test_dearomatize(self):
        inp = "CCCN1C(=O)N=C(O)c2[nH]c[n]c12"
        r = make_request("dearomatize", (("moldata", inp),))
        self.assertEquals(200, r.code)
        status, molfile = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        smiles = indigo.loadMolecule(molfile).canonicalSmiles()
        self.assertEquals(smiles, "CCCN1C(=O)N=C(O)C2NC=NC1=2")

    def test_calculate_cip(self):
        inp = "CCCN1C(=O)N=C(O)c2[nH]c[n]c12"
        r = make_request("calculate_cip", (("moldata", inp),))
        self.assertEquals(200, r.code)
        status, molfile = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        smiles = indigo.loadMolecule(molfile).canonicalSmiles()
        self.assertEquals(smiles, "CCCN1C(=O)N=C(O)C2NC=NC1=2")
                          
    def test_getinchi(self):
        inp = "CCCN1C(=O)N=C(O)c2[nH]c[n]c12"
        r = make_request("getinchi", (("moldata", inp),))
        self.assertEquals(200, r.code)
        status, inchi = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        self.assertEquals(inchi, "InChI=1S/C8H10N4O2/c1-2-3-12-6-5(9-4-10-6)7(13)11-8(12)14/h4H,2-3H2,1H3,(H,9,10)(H,11,13,14)")

    def test_open(self):
        filedata = "test string 123123"
        #filedata = indigo.loadQueryMolecule(inp).molfile()
        r = make_request("open", (("filedata", filedata),))
        self.assertEquals(200, r.code)
        responce = r.read().split('\n',1)
        self.assertEquals(responce, ['<html><body onload="parent.ui.loadMoleculeFromFile()" title="T2suCg==dGVzdCBzdHJpbmcgMTIzMTIz"></body></html>'])

    def test_save(self):
        filetype, filedata = "smi", "CCCN1C(=O)N=C(O)c2[nH]c[n]c12"
        r = make_request("save", (("filedata", filetype + "\n" + filedata),))
        self.assertEquals(200, r.code)
        # TODO: assert header
        self.assertEquals(filedata, r.read())

    def test_automap(self):
        smiles = "CCN>>NCC"
        r = make_request("automap", (("smiles", smiles),), False)
        self.assertEquals(200, r.code)
        status, rxnfile = r.read().split('\n',1)
        self.assertEquals(status, "Ok.")
        self.assertEquals("[CH3:1][CH2:2][NH2:3]>>[NH2:3][CH2:2][CH3:1]", indigo.loadReaction(rxnfile).smiles())

def usage():
    print 'api_test.py -u <base_url>'

if __name__ == '__main__':
    try:
        opts, args = getopt.getopt(sys.argv[1:], "u:", ["url="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            usage()
            sys.exit()
        elif opt in ("-u", "--url"):
            base_url = arg
        else:
            usage()
            sys.exit(2)

    suite = unittest.TestLoader().loadTestsFromTestCase(TestKetcherServerApi)
    unittest.TextTestRunner(verbosity=3).run(suite)
