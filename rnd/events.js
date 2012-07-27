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

if (!window.rnd)
	rnd = {};

rnd.MouseEvent = function (params)
{
    // TODO: deal with multitouch
    if ('touches' in params)
    {
        this.touches = params.touches.length;
        
        if (params.touches.length == 1)
        { // Only deal with one finger
            var touch = params.touches[0]; // Get the information for finger #1
            
            this.pageX = touch.pageX;
            this.pageY = touch.pageY;
        }
    } else
    {
        this.pageX = params.pageX;
        this.pageY = params.pageY;
    }
    
	if (Object.isUndefined(this.pageX) || Object.isUndefined(this.pageY))
	{ // TODO: fix this in IE
		this.pageX = params.x;
		this.pageY = params.y;
	}
	this.altKey = params.altKey;
	this.shiftKey = params.shiftKey;
	this.ctrlKey = params.ctrlKey;
	this.metaKey = params.metaKey;
};
