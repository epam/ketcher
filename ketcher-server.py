import os
import cgi
import sys
import base64
import BaseHTTPServer
import SimpleHTTPServer
from SimpleHTTPServer import *
from BaseHTTPServer import *
import indigo
import traceback

port = 8080
indigo = indigo.Indigo()
indigo.setOption("ignore-stereochemistry-errors", "true")

if len(sys.argv) > 1:
	port = int(sys.argv[1])

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

    try:
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
    except:
        responce = "Error.\n"
        message = str(sys.exc_info()[1])
        responce += message+"\n";
        self.wfile.write(responce)
        return

    SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
    
  def aromatize(self, moldata, dearomatize, is_query):
        responce=""
        if moldata.startswith('$RXN'):
          if is_query:
            rxn = indigo.loadQueryReaction(moldata)
          else:
            rxn = indigo.loadReaction(moldata)
          if dearomatize:
            print 'dearomatize'
            rxn.dearomatize()
          else:
            print 'aromatize'
            rxn.aromatize()
          responce += "Ok.\n"
          responce += rxn.rxnfile()
        else:
          if is_query:
            mol = indigo.loadQueryMolecule(moldata)
          else:
            mol = indigo.loadMolecule(moldata)
          if dearomatize:
            mol.dearomatize()
          else:
            mol.aromatize()
          responce += "Ok.\n"
          responce += mol.molfile()
        return responce
    
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
        rest = "\r\n".join(lines[1:])

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

    if self.path.endswith("aromatize"):
      dearomatize=self.path.endswith("dearomatize")
      length = int(self.headers['content-length'])
      self.globals = dict(cgi.parse_qsl(self.rfile.read(length)))
      self.send_response(200)
      self.send_header('Content-type', 'text/plain')
      self.end_headers()
      moldata = self.globals['moldata']
      responce=""
      try:
        responce = self.aromatize(moldata, dearomatize, False)
      except:
        responce += "Error.\n"
        message = str(sys.exc_info()[1])
        fixed = False
        if message.startswith("\"molfile loader:") and message.endswith("queries\""): # hack to avoid user confusion
          if not dearomatize:
              responce = ""
              try:
                print "Try to load as query"
                responce = self.aromatize(moldata, dearomatize, True)
                print "Done"
                fixed = True
              except:
                responce = "Error.\n"
                responce += str(sys.exc_info()[1])
          else:
            responce += "Molecules and reactions containing query features cannot be dearomatized yet.\n" 
        else:
          responce += message+"\n";
        if not fixed:
            responce += '\n'.join(traceback.format_exception(sys.exc_type, sys.exc_value, sys.exc_traceback))
      self.wfile.write(responce)
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
