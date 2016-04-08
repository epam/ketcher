#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
from os import path, getcwd
from mimetypes import guess_type
from cgi import FieldStorage
from wsgiref.util import FileWrapper
from wsgiref.headers import Headers

from base64 import b64encode

try:
    import indigo
    import indigo_inchi
except:
    sys.stderr.write("WARNING: Indigo is not found. Chemical server-side functionality " + \
                     "will not be available\n")

class application(object):
    # don't serve static by default
    static_serve = False
    static_root = None
    static_alias = { '' : 'ketcher.html' }

    indigo_defaults = {
        'ignore-stereochemistry-errors': 'true',
        'smart-layout': 'true'
    }

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

    def indigo_moldata(method):
        def wrapper(self, **args):
            if not self.indigo_init():
                raise self.HttpException("501 Not Implemented",
                                         "Sorry, no Indigo libs")
            molstr = None
            if self.method == 'GET' and 'smiles' in self.fields:
                molstr = self.fields.getfirst('smiles')
            elif self.is_form_request() and 'moldata' in self.fields:
                molstr = self.fields.getfirst('moldata')

            if not molstr:
                raise self.HttpException("400 Bad Request",
                                         "No molecule data")
            try:
                return "Ok.\n", method(self, *self.moldata(molstr))
            except indigo.IndigoException as e:
                message = str(sys.exc_info()[1])
                if "indigoLoad" in message:    # error on load
                    message = "Cannot load the specified " + \
                              "structure: %s" % str(e)
                    raise self.HttpException("400 Bad Request",
                                             message)
                raise self.HttpException("400 Bad Request",
                                         "Indigo error: %s" % message)

            except Exception as e:
                raise self.HttpException("500 Server Error",
                                         "Something went wrong: %s" % str(e))

        return wrapper

    def indigo_init(self):
        try:
            self.indigo = indigo.Indigo()
            self.indigo.inchi = indigo_inchi.IndigoInchi(self.indigo)
            for option, value in self.indigo_defaults:
                self.indigo.setOption(option, value)
        except:
            return None

    def moldata(self, molstr):
        if molstr.startswith('InChI'):
            return self.indigo.inchi.loadMolecule(molstr), False, False
        else:
            is_rxn = '>>' in molstr or molstr.startswith('$RXN') or '<reactantList>' in molstr
            try:
                md = self.indigo.loadReaction(molstr) if is_rxn else \
                     self.indigo.loadMolecule(molstr)
                return md, is_rxn, False
            except:
                message = str(sys.exc_info()[1])
                if not message.startswith("molfile loader:") or \
                   not message.endswith("queries"):
                    raise

            md = self.indigo.loadQueryReaction(molstr) if is_rxn else \
                 self.indigo.loadQueryMolecule(molstr)
            return md, is_rxn, True

    def on_knocknock(self):
        if not self.indigo_init():     # raise to be backward-compatible
            raise self.HttpException("501 Not Implemented",
                                     "Indigo libraries are not found")
        return "You are welcome!"

    @indigo_moldata
    def on_smiles(self, md, is_rxn, is_query):
        return md.smiles()

    @indigo_moldata
    def on_getinchi(self, md, is_rxn, is_query):
        return self.indigo.inchi.getInchi(md)

    @indigo_moldata
    def on_getmolfile(self, md, is_rxn, is_query):
        return md.rxnfile() if is_rxn else md.molfile()

    @indigo_moldata
    def on_getcml(self, md, is_rxn, is_query):
        return md.cml()

    @indigo_moldata
    def on_layout(self, md, is_rxn, is_query):
        if 'selective' in self.fields:        # old versions
            return self.on_selective_layout() # interface compat
        md.layout()
        return md.rxnfile() if is_rxn else md.molfile()

    @indigo_moldata
    def on_automap(self, md, is_rxn, is_query):
        mode = self.fields.getfirst('mode', 'discard')
        md.automap(mode)
        return md.rxnfile() if is_rxn else md.molfile()

    @indigo_moldata
    def on_aromatize(self, md, is_rxn, is_query):
        md.aromatize()
        return md.rxnfile() if is_rxn else md.molfile()

    @indigo_moldata
    def on_dearomatize(self, md, is_rxn, is_query):
        if is_query:
            raise self.HttpException("400 Bad Request",
                                     "Molecules and reactions " + \
                                     "containing query features " + \
                                     "cannot be dearomatized yet.")
        md.dearomatize()
        return md.rxnfile() if is_rxn else md.molfile()

    @indigo_moldata
    def on_calculate_cip(self, md, is_rxn, is_query):
        self.indigo.setOption('molfile-saving-add-stereo-desc', True)
        return md.rxnfile() if is_rxn else md.molfile()

    def on_open(self):
        if self.is_form_request():
            self.headers.add_header('Content-Type', 'text/html')
            return "".join(["<html><body onload=\"parent.ui.loadMoleculeFromFile()\" title=\"",
                            b64encode("Ok.\n"),
                            b64encode(self.fields.getfirst('filedata')),
                            "\"></body></html>"])
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
                                    filename="ketcher.%s" % type)
            return data
        self.notsupported()

    @indigo_moldata
    def on_selective_layout(self, md, is_rxn, is_query):
        if is_rxn:
            for mol in md.iterateMolecules():
                self.layout_selective(mol)
        else:
            for rg in md.iterateRGroups():
                for frag in rg.iterateRGroupFragments():
                    self.layout_selective(frag)
            self.layout_selective(md)
        return md.rxnfile() if is_rxn else md.molfile()

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
            progname = "python " + progname
        print( "USAGE:\n   %s [static_dir [port|address:port]]\n" % progname)

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
