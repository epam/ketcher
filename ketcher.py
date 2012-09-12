#!/usr/bin/env python

import sys
import traceback
from os import path
from mimetypes import guess_type
from cgi import FieldStorage
from wsgiref.util import FileWrapper
from wsgiref.headers import Headers

from base64 import b64encode

import indigo
from indigo import IndigoException
indigo = indigo.Indigo()
indigo.setOption("ignore-stereochemistry-errors", "true")

class application(object):
    # don't serve static by default
    static_serve = False
    static_alias = { '' : 'ketcher.html' }

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
            route = self.serve_static if self.method == 'GET' and self.static_serve else \
                    self.notsupported

        try:
            status = '200 OK'
            self.response = route()
        except IndigoException as e:
            self.response = self.error_response(str(e))
            if 'indigoLoad' in self.response[-1]:      # error on load
                self.response[1] = "Cannot load the specified structure: %s " % str(e)
        except self.HttpException as (status, message):
            self.response = [message]

        self.headers.setdefault('Content-Type', 'text/plain')
        start_response(status, self.headers.items())

    def __iter__(self):
        for chunk in self.response:
            yield chunk

    def on_knocknock(self):
        return ["You are welcome!"]

    def on_layout(self):
        moldata = None
        if self.method == 'GET' and 'smiles' in self.fields:
            moldata = self.fields.getfirst('smiles')
        elif self.is_form_request() and 'moldata' in self.fields:
            moldata = self.fields.getfirst('moldata')

        if moldata:
            if '>>' in moldata or moldata.startswith('$RXN'):
                rxn = indigo.loadQueryReaction(moldata)
                rxn.layout()
                return ["Ok.\n",
                        rxn.rxnfile()]
            else:
                mol = indigo.loadQueryMolecule(moldata)
                mol.layout()
                return ["Ok.\n",
                        mol.molfile()]
        self.notsupported()

    def on_automap(self):
        moldata = None
        if self.method == 'GET' and 'smiles' in self.fields:
            moldata = self.fields.getfirst('smiles')
        elif self.is_form_request() and 'moldata' in self.fields:
            moldata = self.fields.getfirst('moldata')

        if moldata:
            mode = self.fields.getfirst('mode', 'discard')
            rxn = indigo.loadQueryReaction(moldata)
            if not moldata.startswith('$RXN'):
                rxn.layout()
            rxn.automap(mode)
            return ["Ok.\n",
                    rxn.rxnfile()]
        self.notsupported()

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
            if type == 'smi':
                self.headers.add_header('Content-Type', 'chemical/x-daylight-smiles')
            elif type == 'mol':
                if rest.startswith('$RXN'):
                    type = 'rxn'
                self.headers.add_header('Content-Type',
                                        'chemical/x-mdl-%sfile' % type)

            self.headers.add_header('Content-Length', str(len(data)))
            self.headers.add_header('Content-Disposition', 'attachment', filename='ketcher.%s' % type)
            return [data]
        self.notsupported()

    def on_aromatize(self):
        try:
            md, is_rxn = self.load_moldata()
        except:
            message = str(sys.exc_info()[1])
            if message.startswith("\"molfile loader:") and message.endswith("queries\""): # hack to avoid user confusion
                try:
                    md, is_rxn = self.load_moldata(True)
                except:
                    return self.error_response()

            else:
                return self.error_response()
        md.aromatize()
        return ["Ok.\n",
                md.rxnfile() if is_rxn else md.molfile()]


    def on_dearomatize(self):
        try:
            md, is_rxn = self.load_moldata()
        except:
            return self.error_response("Molecules and reactions containing query features cannot be dearomatized yet.")

        md.dearomatize()
        return ["Ok.\n",
                md.rxnfile() if is_rxn else md.molfile()]


    class HttpException(Exception): pass

    def load_moldata(self, is_query=False):
        moldata = self.fields.getfirst('moldata')
        if moldata.startswith('$RXN'):
            if is_query:
                md = indigo.loadQueryReaction(moldata)
            else:
                md = indigo.loadReaction(moldata)
            is_rxn = True
        else:
            if is_query:
                md = indigo.loadQueryMolecule(moldata)
            else:
                md = indigo.loadMolecule(moldata)
            is_rxn = False
        return md, is_rxn

    def error_response(self, message=None):
        return ["Error.\n",
                message or str(sys.exc_info()[1]), '\n',
                '\n'.join(traceback.format_exception(sys.exc_type, sys.exc_value, sys.exc_traceback))]

    def notsupported(self):
        raise self.HttpException('405 Method Not Allowed',
                                 'Request not supported')

    def serve_static(self):
        root = path.abspath(path.dirname(__file__))
        fpath = self.static_alias.get(self.path, self.path)
        fpath = path.abspath(path.join(root, fpath))

        if not fpath.startswith(root + path.sep) or not path.isfile(fpath) \
           or fpath == path.abspath(__file__):
            raise self.HttpException('404 Not Found',
                                     'Requested file isn\'t accessible')

        self.headers['Content-Type'] = guess_type(fpath)[0] or 'text/plain'
        try:
            fd = open(fpath, 'rb')
            return self.FileWrapper(fd) if self.method == 'GET' else ['']
        except (IOError, OSError):
            raise self.HttpException('402 Payment Required',  # or 403, hmm..
                                     'Must get more money for overtime')

    def is_form_request(self):
        return self.method == 'POST' and \
               (self.content_type.startswith('application/x-www-form-urlencoded')
                or self.content_type.startswith('multipart/form-data'))

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
        print "USAGE:\n   %s [port|address:port]\n" % progname

    application.static_serve = True     # allow to serve static
    try:                                # in standalone python-server mode
        address, port = parse_args()
        httpd = make_server(address, port, application)
        print "Serving on %s:%d..." % (address, port)
        httpd.serve_forever()
    except ValueError:
        usage()
    except (socket.error, socket.gaierror, socket.herror) as (n, str):
        print "Server error.", str
        usage()
