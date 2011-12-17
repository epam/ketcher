import os
import cgi
import sys
import base64
import BaseHTTPServer
import SimpleHTTPServer
from SimpleHTTPServer import *
from BaseHTTPServer import *
import indigo

port = 8080
indigo = indigo.Indigo()

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    if self.path.endswith("knocknock"):
      self.send_response(200)
      self.send_header('Content-type',  'text/plain')
      self.end_headers()
      self.wfile.write("You are welcome!")
      return
    if self.path.find('?') != -1:
      self.path, self.query_string = \
          self.path.split('?', 1)
    else:
      self.query_string = ''
      
    self.globals = dict(cgi.parse_qsl(self.query_string))
      
    if self.path.endswith("layout"):
      self.send_response(200)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      smiles = self.globals['smiles']
      if '>>' in smiles or smiles.startswith('$RXN'):
        rxn = indigo.loadQueryReaction(smiles)
        rxn.layout()
        self.wfile.write("Ok.\n")
        self.wfile.write(rxn.rxnfile())
      else:
        mol = indigo.loadQueryMolecule(smiles)
        mol.layout()
        self.wfile.write("Ok.\n")
        self.wfile.write(mol.molfile())
      return

    if self.path.endswith("automap"):
      self.send_response(200)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      smiles = self.globals['smiles']
      if 'mode' in self.globals:
        mode = self.globals['mode']
      else:
        mode = 'discard'
      rxn = indigo.loadQueryReaction(smiles)
      if not smiles.startswith('$RXN'):
        rxn.layout()
      rxn.automap(mode)
      self.wfile.write("Ok.\n")
      self.wfile.write(rxn.rxnfile())
      return

    SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
    
  def do_POST(self):
    ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
    if ctype == 'multipart/form-data':
      if self.path.endswith("open"):
        query = cgi.parse_multipart(self.rfile, pdict)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write("<html><body onload=\"parent.ui.loadMoleculeFromFile()\" title=\"");
        self.wfile.write(base64.b64encode("Ok.\n"));
        self.wfile.write(base64.b64encode(query['filedata'][0]));
        self.wfile.write("\"></body></html>");
        return
      if self.path.endswith("save"):
        query = cgi.parse_multipart(self.rfile, pdict)
        filedata = query['filedata'][0]
        lines = filedata.splitlines()
        first = lines[0].strip()
        rest = "\n".join(lines[1:])

        self.send_response(200)
        if first == "smi":
          self.send_header('Content-type', 'chemical/x-daylight-smiles')
        elif first == "mol":
          if rest.startswith('$RXN'):
            first = "rxn"
            self.send_header('Content-type', 'chemical/x-mdl-rxnfile')
          else:
            self.send_header('Content-type', 'chemical/x-mdl-molfile')
        else:
          self.send_header('Content-type', 'text/plain')

        self.send_header('Content-Length', len(rest))
        self.send_header('Content-Disposition', 'attachment; filename=ketcher.' + first)
        self.end_headers()
        self.wfile.write(rest)
      return

    if self.path.endswith("layout"):
      length = int(self.headers['content-length'])
      self.globals = dict(cgi.parse_qsl(self.rfile.read(length)))
      self.send_response(200)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      moldata = self.globals['moldata']
      if '>>' in moldata or moldata.startswith('$RXN'):
        rxn = indigo.loadQueryReaction(moldata)
        rxn.layout()
        self.wfile.write("Ok.\n")
        self.wfile.write(rxn.rxnfile())
      else:
        mol = indigo.loadQueryMolecule(moldata)
        mol.layout()
        self.wfile.write("Ok.\n")
        self.wfile.write(mol.molfile())
      return

    if self.path.endswith("automap"):
      length = int(self.headers['content-length'])
      self.globals = dict(cgi.parse_qsl(self.rfile.read(length)))
      self.send_response(200)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      moldata = self.globals['moldata']
      if 'mode' in self.globals:
        mode = self.globals['mode']
      else:
        mode = 'discard'
      rxn = indigo.loadQueryReaction(moldata)
      if not moldata.startswith('$RXN'):
        rxn.layout()
      rxn.automap(mode)
      self.wfile.write("Ok.\n")
      self.wfile.write(rxn.rxnfile())
      return

HandlerClass = MyHandler #SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

server_address = ('', port)

HandlerClass.protocol_version = Protocol
httpd = ServerClass(server_address, HandlerClass)

sa = httpd.socket.getsockname()
print "Serving HTTP on", sa[0], "port", sa[1], "..."
httpd.serve_forever()
