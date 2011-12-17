import os
import base64
import indigo

indigo = indigo.Indigo("/var/www/gga/ketcher/lib")

from django.conf.urls.defaults import patterns, url
from django.http import Http404, HttpResponse

def handle_knock(request):
    return HttpResponse(content="You are welcome!", mimetype='text/plain')

def handle_layout(request):
    if request.method == 'GET' and request.GET.has_key("smiles"):
        moldata = request.GET["smiles"]
    elif request.method == 'POST' and request.POST.has_key("moldata"):
        moldata = request.POST["moldata"]
    else:
        raise Http404
    if '>>' in moldata or moldata.startswith('$RXN'):
      rxn = indigo.loadQueryReaction(moldata)
      rxn.layout()
      return HttpResponse(content="Ok.\n" + rxn.rxnfile(), mimetype='text/plain')
    else:
      mol = indigo.loadQueryMolecule(moldata)
      mol.layout()
      return HttpResponse(content="Ok.\n" + mol.molfile(), mimetype='text/plain')

def handle_automap(request):
    mode = 'discard'
    if request.method == 'GET' and request.GET.has_key("smiles"):
        rnxdata = request.GET["smiles"]
        if request.GET.has_key("mode"):
          mode = request.GET["mode"]
    elif request.method == 'POST' and request.POST.has_key("moldata"):
        rnxdata = request.POST["moldata"]
        if request.POST.has_key("mode"):
          mode = request.POST["mode"]
    else:
        raise Http404
    rxn = indigo.loadQueryReaction(rnxdata)
    if not rnxdata.startswith('$RXN'):
      rxn.layout()
    rxn.automap(mode)
    return HttpResponse(content="Ok.\n" + rxn.rxnfile(), mimetype='text/plain')

def handle_save(request):
    filedata = request.POST['filedata']
    lines = filedata.splitlines()
    first = lines[0].strip()
    rest = "\n".join(lines[1:])

    mimet = 'text/plain'
    if first == "smi":
        mimet = 'chemical/x-daylight-smiles'
    elif first == "mol":
        if rest.startswith('$RXN'):
          first = "rxn"
          mimet = 'chemical/x-mdl-rxnfile'
        else:
          mimet = 'chemical/x-mdl-molfile'
        
    resp = HttpResponse(content=rest, mimetype=mimet)
    resp['Content-Length'] = len(rest)
    resp['Content-Disposition'] = 'attachment; filename=ketcher.' + first
    return resp

def handle_open(request):
    filedata = request.FILES["filedata"]
    data = filedata.read()
    resp = HttpResponse(content="<html><body onload=\"parent.ui.loadMoleculeFromFile()\" title=\"" + base64.b64encode("Ok.\n" + data) + "\"></body></html>", mimetype="text/html")
    return resp

urlpatterns = patterns('',
    url(r'^knocknock$', handle_knock),
    url(r'^layout$', handle_layout),
    url(r'^save$', handle_save),
    url(r'^open$', handle_open))
