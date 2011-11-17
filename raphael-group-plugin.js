/**
 * Adds grouping to raphael (only for SVG). Does not break IE/VML, but no groups.
 *
 */
(function() {

    var d = document;

    Raphael.fn.group = function(id) {
        var enabled = d.getElementsByTagName("svg").length > 0;
        if (!enabled) {
            // return a stub for VML compatibility
            return {
                add : function() {
                    // intentionally left blank
                }
            };
        }
        var svg = "http://www.w3.org/2000/svg";
        var canvas = this.canvas;
        this.groupElement = d.createElementNS(svg, "g");
        this.groupElement.id = id;
        var that = this;
        canvas.appendChild(this.groupElement);
        this.groupElement.resetTransform = function() {
            this.removeAttribute("transform");
        };
        this.groupElement.translate = function(a, b) {
            this.previous = this.getAttribute("transform") ? this.getAttribute("transform") : "";
            this.setAttribute("transform", "" + this.previous + "translate(" + a + "," + b + ")")
        };
        this.groupElement.rotate = function(a, b, f) {
            this.previous = this.getAttribute("transform") ? this.getAttribute("transform") : "";
            this.setAttribute("transform", "" + this.previous + " rotate(" + a + "," + b + "," + f + ")")
        };
        this.groupElement.scale = function(a, b) {
            this.previous = this.getAttribute("transform") ? this.getAttribute("transform") : "";
            this.setAttribute("transform", "" + this.previous + " scale(" + a + "," + b + ")")
        };
        this.groupElement.add = function(raphaelElement) {
            that.groupElement.appendChild(raphaelElement.node);
        };
        return this.groupElement;
    };
})();

