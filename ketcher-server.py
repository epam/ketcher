import os
import cgi
import sys
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
      self.send_header('Content-type',	'text/plain')
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
      mol = indigo.loadQueryMolecule(self.globals['smiles'])
      mol.layout()
      self.wfile.write("Ok.\n")
      self.wfile.write(mol.molfile())
      return

    SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
    
  def do_POST(self):
    ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
    if ctype == 'multipart/form-data':
      if self.path.endswith("open"):
        query = cgi.parse_multipart(self.rfile, pdict)
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("Ok.\n");
        self.wfile.write(query['filedata'][0]);
        return
      if self.path.endswith("save"):
        query = cgi.parse_multipart(self.rfile, pdict)
        filedata = query['filedata'][0]
        first = filedata.split("\n")[0]
        rest = "\n".join(filedata.split("\n")[1:])

        self.send_response(200)
        if first == "smi":
          self.send_header('Content-type', 'chemical/x-daylight-smiles')
        elif first == "mol":
          self.send_header('Content-type', 'chemical/x-mdl-molfile')
        else:
          self.send_header('Content-type', 'text/plain')

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
      mol = indigo.loadQueryMolecule(self.globals['moldata'])
      mol.layout()
      self.wfile.write("Ok.\n")
      self.wfile.write(mol.molfile())
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
