#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
from os import path, getcwd
from mimetypes import guess_type
from cgi import FieldStorage
from wsgiref.util import FileWrapper
from wsgiref.headers import Headers

from base64 import b64encode

class application(object):
    # don't serve static by default
    static_serve = False
    static_alias = { '' : 'ketcher.html' }
    static_root = None

    indigo = None
    indigo_inchi = None

    def __init__(self, environ, start_response):
        self.path = environ['PATH_INFO'].strip('/')
        self.method = environ['REQUEST_METHOD']
        self.content_type = environ.get('CONTENT_TYPE', '')
        self.fields = FieldStorage(fp=environ['wsgi.input'],
                                   environ=environ, keep_blank_values=True)
        self.FileWrapper = environ.get('wsgi.file_wrapper', FileWrapper)
        self.headers = Headers([])

        if self.static_serve:
            self.headers['Access-Control-Allow-Origin'] = '*'

        route = getattr(self, 'on_' + self.path, None)
        if route is None:
            route = self.serve_static if self.method == 'GET' and \
                                         self.static_serve else self.notsupported

        status = "200 OK"
        try:
            self.response = route()
        except self.HttpException as e:
            status = e.args[0]
            self.response = e.args[1]

        self.headers.setdefault('Content-Type', 'text/plain')
        start_response(status, self.headers.items())

    def __iter__(self):
        chunks = self.response if not isinstance(self.response, basestring) else [self.response]
        for chunk in chunks:
            yield chunk if sys.version_info.major < 3 or \
                           not hasattr(chunk, 'encode') else chunk.encode()

    def indigo_required(method):
        def wrapper(self, **args):
            if not self.indigo:
                raise self.HttpException("501 Not Implemented",
                                         "Indigo libraries are not found")
            return method(self, **args)
        return wrapper

    def load_moldata(self):
        if self.method == 'GET' and 'smiles' in self.fields:
            moldata = self.fields.getfirst('smiles')
        elif self.is_form_request() and 'moldata' in self.fields:
            moldata = self.fields.getfirst('moldata')

        if not moldata:
            raise self.HttpException("400 Bad Request",
                                     "No molecule data")
        try:
            if moldata.startswith('InChI'):
                return self.indigo_inchi.loadMolecule(moldata), False, False
            else:
                is_rxn = '>>' in moldata or moldata.startswith('$RXN') or '<reactantList>' in moldata
                try:
                    md = self.indigo.loadReaction(moldata) if is_rxn else \
                         self.indigo.loadMolecule(moldata)
                    return md, is_rxn, False
                except:
                    message = str(sys.exc_info()[1])
                    if not message.startswith("\"molfile loader:") or \
                       not message.endswith("queries\""):
                        raise

                md = self.indigo.loadQueryReaction(moldata) if is_rxn else \
                     self.indigo.loadQueryMolecule(moldata)
                return md, is_rxn, True

        except indigo.IndigoException as e:
            message = str(sys.exc_info()[1])
            if 'indigoLoad' in message:    # error on load
                message = "Cannot load the specified " + \
                          "structure: %s " % str(e)
                raise self.HttpException("400 Bad Request",
                                         message)

    @indigo_required
    def on_knocknock(self):
        return "You are welcome!"

    @indigo_required
    def on_smiles(self):
        md, is_rxn, _ = self.load_moldata()
        return "Ok.\n", md.smiles()

    @indigo_required
    def on_getinchi(self):
        md, is_rxn, _ = self.load_moldata()
        return "Ok.\n", self.indigo_inchi.getInchi(md)

    @indigo_required
    def on_getmolfile(self):
        md, is_rxn, _ = self.load_moldata()
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @indigo_required
    def on_getcml(self):
        md, is_rxn, _ = self.load_moldata()
        return "Ok.\n", md.cml()

    @indigo_required
    def on_layout(self):
        if 'selective' in self.fields:
            return self.on_selective_layout()
        md, is_rxn, _ = self.load_moldata()
        md.layout()
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @indigo_required
    def on_automap(self):
        md, is_rxn, _ = self.load_moldata()
        mode = self.fields.getfirst('mode', 'discard')
        md.automap(mode)
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @indigo_required
    def on_aromatize(self):
        md, is_rxn, _ = self.load_moldata()
        md.aromatize()
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @indigo_required
    def on_dearomatize(self):
        md, is_rxn, is_query = self.load_moldata()
        if is_query:
            raise self.HttpException("400 Bad Request",
                                     "Molecules and reactions " + \
                                     "containing query features " + \
                                     "cannot be dearomatized yet.")
        md.dearomatize()
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @indigo_required
    def on_calculate_cip(self):
        md, is_rxn, _ = self.load_moldata()
        application.indigo.setOption('molfile-saving-add-stereo-desc', True)
        res = md.rxnfile() if is_rxn else md.molfile()
        application.indigo.setOption('molfile-saving-add-stereo-desc', False)
        return "Ok.\n", res

    def on_open(self):
        if self.is_form_request():
            self.headers.add_header('Content-Type', 'text/html')
            return ''.join(['<html><body onload="parent.ui.loadMoleculeFromFile()" title="',
                            b64encode("Ok.\n"),
                            b64encode(self.fields.getfirst('filedata')),
                            '"></body></html>'])
        self.notsupported()

    def on_save(self):
        if self.is_form_request():
            type, data = self.fields.getfirst('filedata').split('\n', 1)
            type = type.strip()
            if type == 'smi':
                self.headers.add_header('Content-Type',
                                        'chemical/x-daylight-smiles')
            elif type == 'mol':
                if data.startswith('$RXN'):
                    type = 'rxn'
                self.headers.add_header('Content-Type',
                                        'chemical/x-mdl-%sfile' % type)

            self.headers.add_header('Content-Length', str(len(data)))
            self.headers.add_header('Content-Disposition', 'attachment',
                                    filename='ketcher.%s' % type)
            return data
        self.notsupported()

    @indigo_required
    def on_selective_layout(self):
        md, is_rxn, _ = self.load_moldata()
        if is_rxn:
            for mol in md.iterateMolecules():
                self.layout_selective(mol)
        else:
            for rg in md.iterateRGroups():
                for frag in rg.iterateRGroupFragments():
                    self.layout_selective(frag)
            self.layout_selective(md)
        return "Ok.\n", md.rxnfile() if is_rxn else md.molfile()

    @staticmethod
    def layout_selective(mol):
        dsgs = [dsg for dsg in mol.iterateDataSGroups() \
                if dsg.description() == '_ketcher_selective_layout' and \
                dsg.data() == '1']
        atoms = sorted([atom.index() for dsg in dsgs \
                        for atom in dsg.iterateAtoms()])
        for dsg in dsgs:
            dsg.remove()
        mol.getSubmolecule(atoms).layout()
        return mol

    class HttpException(Exception): pass
    def notsupported(self):
        raise self.HttpException("405 Method Not Allowed",
                                 "Request not supported")

    def serve_static(self):
        root = path.realpath(self.static_root or getcwd())
        fpath = self.static_alias.get(self.path, self.path)
        fpath = path.realpath(path.join(root, fpath))

        if not fpath.startswith(root + path.sep) or not path.isfile(fpath) \
           or fpath == path.realpath(__file__):
            raise self.HttpException("404 Not Found",
                                     "Requested file isn't accessible")

        self.headers['Content-Type'] = guess_type(fpath)[0] or 'text/plain'
        try:
            fd = open(fpath, 'rb')
            return self.FileWrapper(fd) if self.method == 'GET' else ['']
        except (IOError, OSError):
            raise self.HttpException("402 Payment Required",  # or 403, hmm..
                                     "Must get more money for overtime")

    def is_form_request(self):
        return self.method == 'POST' and \
               (self.content_type.startswith('application/x-www-form-urlencoded')
                or self.content_type.startswith('multipart/form-data'))

try:
    import indigo
    import indigo_inchi
    application.indigo = indigo.Indigo()
    application.indigo_inchi = indigo_inchi.IndigoInchi(application.indigo)
    application.indigo.setOption('ignore-stereochemistry-errors', 'true')
except:
    pass

if __name__ == '__main__':
    import socket
    from wsgiref.simple_server import make_server

    def parse_args():
        dir = sys.argv[1] if len(sys.argv) > 1 else ''
        addr = sys.argv[2] if len(sys.argv) > 2 else ''
        res = addr.rsplit(':', 1)
        return dir, \
               res[0] if len(res) > 1 else '0.0.0.0', \
               int(res[-1] or 8080)
    def usage():
        progname = sys.argv[0]
        if not progname.startswith('./'):
            progname = 'python ' + progname
        print( "USAGE:\n   %s [static_dir [port|address:port]]\n" % progname)

    if not application.indigo:
        print("WARNING: Indigo is not found. Server-side functionality " + \
              "will not be available")
    try:
        dir, address, port = parse_args()
        application.static_serve = True     # allow to serve static
        application.static_root = dir       # in standalone python-server mode
        httpd = make_server(address, port, application)
        print("Serving on %s:%d..." % (address, port))
        httpd.serve_forever()
    except ValueError:
        usage()
    except (socket.error, socket.gaierror, socket.herror, OSError) as e:
        print("Server error: %s" % e.args[1])
        usage()
    except KeyboardInterrupt:
        pass
