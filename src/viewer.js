function init(url, width, height) {    
    if(!url) {    
	url='./';
    }
    if (!width || !height) {
	var requets = OpenLayers.Request.GET({
	    url: url + "ImageProperties.xml",
	    async: false
	});		
	var imageDocument = requets.responseXML;
	var imageElement = imageDocument.getElementsByTagName('IMAGE_PROPERTIES');
	width = imageElement[0].getAttribute('WIDTH');
	height = imageElement[0].getAttribute('HEIGHT')
    }  
  
    var zoomify = new OpenLayers.Layer.Zoomify("Zoomify", url, new OpenLayers.Size(width, height));	       
    zoomify.transitionEffect = 'resize';	
    zoomify.isBaseLayer = false;    
    var resolutions = [];
    for(var i = zoomify.numberOfTiers-1; i>=0; i--) {
	resolutions.push(Math.pow(2, i));      
    }		
    var image = new OpenLayers.Layer.Image('Image',
	  url + "TileGroup0/0-0-0.jpg",
	  new OpenLayers.Bounds(0, 0, width, height),
	  zoomify.tierImageSize[0],
	  { alwaysInRange: true }
    );    	

    var options = {
	controls: [],
	resolutions: resolutions,
	maxExtent: new OpenLayers.Bounds(0, 0, width, height),
	numZoomLevels: zoomify.numberOfTiers,
	units: 'pixels'
    };
   
    var overviewOptions = {
	div:document.getElementById('ol-overview'),
	size: zoomify.tierImageSize[0], 
	autoPan:false,
	mapOptions: { numZoomLevels: 1 }
    };
    
    var overview = new OpenLayers.Control.OverviewMap(overviewOptions) ;
    overview.isSuitableOverview = function() { 
	return true;       
    };
   
    var map = new OpenLayers.Map("ol-image", options);
    map.addLayer(zoomify);
    map.addLayer(image);

    map.addControl(new OpenLayers.Control.Zoom());
    //map.addControl(new OpenLayers.Control.MouseDefaults());
    map.addControl(new OpenLayers.Control.KeyboardDefaults());
    map.addControl(overview);
    map.addControl(new OpenLayers.Control.Navigation({
	mouseWheelOptions: {
	    cumulative: false,
	    interval: 0
	},
        dragPanOptions: {
            enableKinetic: true
            },
	zoomBoxEnabled: false,
	zoomWheelEnabled: true
    }));
    map.zoomToMaxExtent();
};

