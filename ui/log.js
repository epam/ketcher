/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 * 
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 * 
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (typeof(ui) == 'undefined')
    ui = function () {};

ui.Log = function ()
{
    this.messages = new Array();
}

ui.Log.prototype.write = function (msg)
{
    if (msg != null && msg.strip() != '')
    {
        this.messages.push(msg); 
        $('console').innerHTML = '<pre>' + this.messages.join('') + '</pre>';
        $('console').scrollTop = $('console').scrollHeight; 
    }
}

ui.Log.prototype.writeLine = function (msg)
{
    if (msg != null && msg.strip() != '')
    {
        if (this.messages.length > 0 && this.messages.last().endsWith('\n'))
            this.write(msg + '\n');
        else
            this.write('\n' + msg + '\n');
    }
}