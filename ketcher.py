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

        route = getattr(self, 'on_' + self.path, None)
        if route is None:
            route = self.serve_static if self.method == 'GET' and \
                                         self.static_serve else self.notsupported

        status = "200 OK"
        try:
            self.response = route()
        except self.HttpException as e:
            status = e.args[0]
            self.response = [e.args[1]]

        self.headers.setdefault('Content-Type', 'text/plain')
        start_response(status, self.headers.items())

    def __iter__(self):
        for chunk in self.response:
            yield chunk if sys.version_info[0] < 3 or \
                           not hasattr(chunk, 'encode') else chunk.encode()

    def notsupported(self):
        raise self.HttpException("405 Method Not Allowed",
                                 "Request not supported")

    def indigo_required(method):
        def wrapper(self, **args):
            if not self.indigo:
                raise self.HttpException("501 Not Implemented",
                                         "Indigo libraries are not found")
            try:
                return method(self, **args)
            except indigo.IndigoException as e:
                message = str(sys.exc_info()[1])
                if 'indigoLoad' in message:    # error on load
                    message = "Cannot load the specified " + \
                              "structure: %s " % str(e)
                raise self.HttpException("400 Bad Request",
                                         message)
        return wrapper

    @indigo_required
    def on_knocknock(self):
        return ["You are welcome!"]

    @indigo_required
    def on_layout(self):
        moldata = None
        if self.method == 'GET' and 'smiles' in self.fields:
            moldata = self.fields.getfirst('smiles')
        elif self.is_form_request() and 'moldata' in self.fields:
            moldata = self.fields.getfirst('moldata')
        selective = 'selective' in self.fields
        if moldata:
            if '>>' in moldata or moldata.startswith('$RXN'):
                rxn = self.indigo.loadQueryReaction(moldata)
                if selective:
                    for mol in rxn.iterateMolecules():
                        self.selective_layout(mol)
                else:
                    rxn.layout()
                return ["Ok.\n",
                        rxn.rxnfile()]
            elif moldata.startswith('InChI'):
                mol = self.indigo_inchi.loadMolecule(moldata)
                mol.layout()
                return ["Ok.\n",
                        mol.molfile()]
            else:
                mol = self.indigo.loadQueryMolecule(moldata)
                if selective:
                    for rg in mol.iterateRGroups():
                        for frag in rg.iterateRGroupFragments():
                            self.selective_layout(frag)
                    self.selective_layout(mol)
                else:
                    mol.layout()
                return ["Ok.\n",
                        mol.molfile()]
        self.notsupported()

    @indigo_required
    def on_automap(self):
        moldata = None
        if self.method == 'GET' and 'smiles' in self.fields:
            moldata = self.fields.getfirst('smiles')
        elif self.is_form_request() and 'moldata' in self.fields:
            moldata = self.fields.getfirst('moldata')

        if moldata:
            mode = self.fields.getfirst('mode', 'discard')
            rxn = self.indigo.loadQueryReaction(moldata)
            if not moldata.startswith('$RXN'):
                rxn.layout()
            rxn.automap(mode)
            return ["Ok.\n",
                    rxn.rxnfile()]
        self.notsupported()

    @indigo_required
    def on_aromatize(self):
        try:
            md, is_rxn = self.load_moldata()
        except:
            message = str(sys.exc_info()[1])
            if message.startswith("\"molfile loader:") and \
               message.endswith("queries\""): # hack to avoid user confusion
                md, is_rxn = self.load_moldata(True)
            else:
                raise
        md.aromatize()
        return ["Ok.\n",
                md.rxnfile() if is_rxn else md.molfile()]

    @indigo_required
    def on_getinchi(self):
        md, is_rxn = self.load_moldata()
        inchi = self.indigo_inchi.getInchi(md)
        return ["Ok.\n", inchi]

    @indigo_required
    def on_dearomatize(self):
        try:
            md, is_rxn = self.load_moldata()
        except:                 # TODO: test for query features presence
            raise self.HttpException("400 Bad Request",
                                     "Molecules and reactions " + \
                                     "containing query features " + \
                                     "cannot be dearomatized yet.")
        md.dearomatize()
        return ["Ok.\n",
                md.rxnfile() if is_rxn else md.molfile()]

    def on_open(self):
        if self.is_form_request():
            self.headers.add_header('Content-Type', 'text/html')
            return ['<html><body onload="parent.ui.loadMoleculeFromFile()" title="',
                    b64encode("Ok.\n"),
                    b64encode(self.fields.getfirst('filedata')),
                    '"></body></html>']
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
            return [data]
        self.notsupported()

    class HttpException(Exception): pass
    def load_moldata(self, is_query=False):
        moldata = self.fields.getfirst('moldata')
        if moldata.startswith('$RXN'):
            if is_query:
                md = self.indigo.loadQueryReaction(moldata)
            else:
                md = self.indigo.loadReaction(moldata)
            is_rxn = True
        else:
            if is_query:
                md = self.indigo.loadQueryMolecule(moldata)
            else:
                md = self.indigo.loadMolecule(moldata)
            is_rxn = False
        return md, is_rxn

    def selective_layout(self, mol):
        dsgs = [dsg for dsg in mol.iterateDataSGroups() \
                if dsg.description() == '_ketcher_selective_layout' and \
                dsg.data() == '1']
        atoms = sorted([atom.index() for dsg in dsgs \
                        for atom in dsg.iterateAtoms()])
        for dsg in dsgs:
            dsg.remove()
        mol.getSubmolecule(atoms).layout()
        return mol

    def serve_static(self):
        root = self.static_root or getcwd()
        fpath = self.static_alias.get(self.path, self.path)
        fpath = path.abspath(path.join(root, fpath))

        if not fpath.startswith(root + path.sep) or not path.isfile(fpath) \
           or fpath == path.abspath(__file__):
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
        arg = sys.argv[1] if len(sys.argv) > 1 else ''
        res = arg.rsplit(':', 1)
        return res[0] if len(res) > 1 else '0.0.0.0', \
               int(res[-1] or 8080)
    def usage():
        progname = sys.argv[0]
        if not progname.startswith('./'):
            progname = 'python ' + progname
        print( "USAGE:\n   %s [port|address:port]\n" % progname)

    if not application.indigo:
        print("WARNING: Indigo is not found. Server-side functionality " + \
              "will not be available")

    application.static_serve = True     # allow to serve static
    try:                                # in standalone python-server mode
        address, port = parse_args()
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
