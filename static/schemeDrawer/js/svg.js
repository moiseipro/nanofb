var SVG = {

        self:this,
	       
        svgns: 'http://www.w3.org/2000/svg',
	    xlink: 'http://www.w3.org/1999/xlink',
	        createElement: function(name, attrs){
                var element = document.createElementNS(SVG.svgns, name);

	            if(attrs) {
	                SVG.setAttr(element, attrs);
	            }
	            return element;
	        },
	        setAttr: function(element, attrs) {
	            for(var i in attrs) {
	               element.setAttribute(i, attrs[i]);
	            }
	            return element;
	        }
	    }