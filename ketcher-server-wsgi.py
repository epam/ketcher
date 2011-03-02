import os
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
    mol = indigo.loadQueryMolecule(moldata)
    mol.layout()
    return HttpResponse(content="Ok.\n" + mol.molfile(), mimetype='text/plain')

def handle_save(request):
    filedata = request.POST['filedata']
    lines = filedata.splitlines()
    first = lines[0]
    rest = "\n".join(lines[1:])

    mimet = 'text/plain'
    if first == "smi":
        mimet = 'chemical/x-daylight-smiles'
    if first == "mol":
        mimet = 'chemical/x-mdl-molfile'
        
    resp = HttpResponse(content=rest, mimetype=mimet)
    resp['Content-Disposition'] = 'attachment; filename=ketcher.' + first
    return resp

def handle_open(request):
    filedata = request.FILES["filedata"]
    data = filedata.read()
    resp = HttpResponse(content="Ok.\n" + data, mimetype="text/plain")
    return resp

urlpatterns = patterns('',
    url(r'^knocknock$', handle_knock),
    url(r'^layout$', handle_layout),
    url(r'^save$', handle_save),
    url(r'^open$', handle_open))
