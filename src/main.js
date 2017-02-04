goog.provide('cz.mzk.image.viewer.Main');

goog.require('ol.Map');
goog.require('ol.control.OverviewMap');
goog.require('ol.control.Zoom');
goog.require('ol.control.FullScreen');

goog.require('goog.net.XhrIo');


/**
 * @constructor
 */
cz.mzk.image.viewer.Main = function(url, width, height) {

  /**
   * @private
   * @type {!string}
   */
  this.url = url || './';

  /**
   * @private
   * @type {number}
   */
  this.width = width || 0;

  /**
   * @private
   * @type {number}
   */
  this.height = height || 0;

  if (!this.width || !this.height) {
    var this_ = this;
    goog.net.XhrIo.send(this.url + '/ImageProperties.xml', function(e) {
      var xhr = e.target;
      var res = xhr.getResponseXml();
      var props = res.getElementsByTagName('IMAGE_PROPERTIES')[0];
      this_.width = props.getAttribute('WIDTH');
      this_.height = props.getAttribute('HEIGHT');
      this_.initMap();
    });
  } else {
    this.initMap();
  }

}

cz.mzk.image.viewer.Main.prototype.initMap = function() {
  var imgCenter = [this.width / 2, -this.height / 2];

  // Maps always need a projection, but Zoomify layers are not geo-referenced, and
  // are only measured in pixels.  So, we create a fake projection that the map
  // can use to properly display the layer.
  this.projection = new ol.proj.Projection({
    code: 'ZOOMIFY',
    units: 'pixels',
    extent: [0, 0, this.width, this.height]
  });

  var source = new ol.source.Zoomify({
    url: this.url,
    size: [this.width, this.height],
    crossOrigin: 'anonymous'
  });

  this.map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: source
      })
    ],
    target: 'ol-image',
    view: new ol.View({
      projection: this.projection,
      center: imgCenter,
      zoom: 1,
      maxZoom: source.getTileGrid().getMaxZoom() - 1
    }),
    controls: [
      new ol.control.Zoom(),
      new ol.control.FullScreen()
    ]
  });
  this.fit();
}

cz.mzk.image.viewer.Main.prototype.fit = function() {
    var ext = this.projection.getExtent();
    var size = this.map.getSize();
    var wRes = ext[2]/size[0];
    var hRes = ext[3]/size[1];
    this.map.getView().setResolution(Math.max(wRes, hRes));
    this.map.getView().setCenter([ext[2]/2, -ext[3]/2]);
}

goog.exportSymbol('cz.mzk.image.viewer.Main', cz.mzk.image.viewer.Main);
// backward compatibility with old version
goog.exportSymbol('init', cz.mzk.image.viewer.Main);
