Ext.apply(Ext.util.Format, {
	/*numberFormat: {
		decimalSeparator: '.',
		decimalPrecision: 4,
		groupingSeparator: ',',
		groupingSize: 3,
		currencySymbol: 'R$'
	},*/
	formatNumber: function(value, numberFormat) {
		var format = Ext.apply(Ext.apply({}, this.numberFormat), numberFormat);
		if (typeof value !== 'number') {
			value = String(value);
			if (format.currencySymbol) {
				value = value.replace(format.currencySymbol, '');
			}
			if (format.groupingSeparator) {
				value = value.replace(new RegExp(format.groupingSeparator, 'g'), '');
			}
			if (format.decimalSeparator !== '.') {
				value = value.replace(format.decimalSeparator, '.');
			}
			value = parseFloat(value);
			
			if(isNaN(value)) {
				value = 0;
			}
		}
		var neg = value < 0;
		value = Math.abs(value).toFixed(format.decimalPrecision);
		var i = value.indexOf('.');
		if (i >= 0) {
			if (format.decimalSeparator !== '.') {
				value = value.slice(0, i) + format.decimalSeparator + value.slice(i + 1);
			}
		} else {
			i = value.length;
		}
		if (format.groupingSeparator) {
			while (i > format.groupingSize) {
				i -= format.groupingSize;
				value = value.slice(0, i) + format.groupingSeparator + value.slice(i);
			}
		}
		if (format.currencySymbol) {
			value = format.currencySymbol + value;
		}
		if (neg) {
			value = '-' + value;
		}
		return value;
	}
});

var merge = function(el, cp) {
		for(i in cp) {
			if( typeof cp[i] == 'object') {
				if(el[i] == undefined) {
					el[i] = cp[i]
				}
				merge(el[i], cp[i]);
			} else {
				el[i] = cp[i];
			}
		}
	};
	
    var makeJsonFromText = function(id, value) {
        var obj = id.split('.');
        var objeto = {};
        for(var t = obj.length; t > 0  ; t--) {
            var temp = {};
            var name = obj[t-1];
            if(name == obj[obj.length-1]) {
                temp[name] = value;
            } else {
                temp[name] = objeto;
            }
            objeto = temp;
        }
        return objeto;
    };

/**
 * @author Christiano Milfont
 * @class
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o mecanismo de extens�o do ExtJS
 * @classDescription  Objeto que funciona como um Proxy [ver Design pattern Proxy], que 
 * � um mecanismo de captura de dados remotos, integrado ao Framework/Engine DWR.
 * @constructor
 * @param {Object} dwr_facade Objeto Creator do DWR que funciona como uma fachada
 * @param {Object} dwr_filter Objeto que serve como um Filtro para uma "Query By Example"
 * @param {Object} dwr_errorHandler Function personalizada para tratamento de erro do DWR
 * @since 0.1
 * @version 0.5
 * @copyright Milfont.org
 */
Ext.data.DWRProxy = function(dwr_facade, dwr_filter, dwr_errorHandler){
    Ext.data.DWRProxy.superclass.constructor.call(this);
    this.data = dwr_facade;
	this.dwr_filter = dwr_filter;
	/**
	 *
	 * Propriedade para fazer pagina��o, indica que deve cachear a consulta de total de elementos
	 * o controlador [fachada] deve implementar a logica de negocios adequada, quando for false
	 * consulta o total, quando for true consulta apenas a listagem e repete o total
	 * @since 0.4
	 */
	this.dwr_total_cache = false;
	/**
	 * @since 0.5
	 */
	this.dwr_errorHandler = dwr_errorHandler;
};

/**
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o mecanismo de extens�o do ExtJS
 */
Ext.extend(Ext.data.DWRProxy, Ext.data.DataProxy, {
	
	/**
     * Load data from the requested source (in this case an in-memory
     * data object passed to the constructor), read the data object into
     * a block of Ext.data.Records using the passed Ext.data.DataReader implementation, and
     * process that block using the passed callback.
     * @method load
     * @param {Object} params This parameter is not used by the MemoryProxy class.
     * @param {Ext.data.DataReader) reader The Reader object which converts the data
     * object into a block of Ext.data.Records.
     * @param {Function} callback The function into which to pass the block of Ext.data.records.
     * The function must be passed <ul>
     * <li>The Record block object</li>
     * <li>The "arg" argument from the load function</li>
     * <li>A boolean success indicator</li>
     * </ul>
     * @param {Object} scope The scope in which to call the callback
     * @param {Object} arg An optional argument which is passed to the callback as its second parameter.
     */
    load : function(params, reader, callback, scope, arg) {
		/**
		 * Escopo "this" mapeado para a vari�vel s porque dentro do callback do DWR o escopo "this"
		 * n�o pertence a classe.
		 */
		var s = this; 
        params = params || {};
		
		if(params.cache != undefined) {
			this.dwr_total_cache = params.cache;
		}
		
		if(params.filter != undefined) {
			this.dwr_filter = params.filter;
		}
		
        var result;
        try {
			this.data(this.dwr_filter, params.start, params.limit, this.dwr_total_cache, {
				callback:function(response) {
					result = reader.readRecords(response);
					callback.call(scope, result, arg, true);
				},
				errorHandler:function(a, e) {
					scope.fireEvent("loadexception", s, arg, null, e);
					s.dwr_errorHandler(a);
				},
				timeout:100000
			});
			this.dwr_total_cache = true;
        } catch(e) {
            this.fireEvent("loadexception", this, arg, null, e);
            callback.call(scope, null, arg, false);
            return;
        }
       
    }
	
});


/**
 * @author Christiano Milfont
 * @class
 * @extends Ext.data.DWRProxySimple O objeto DWRProxy extende de DataProxy com o mecanismo de extens�o do ExtJS
 * 
 * @classDescription  Objeto que funciona como um Proxy [ver Design pattern Proxy], que 
 * � um mecanismo de captura de dados remotos, integrado ao Framework/Engine DWR. Esse funciona sem pagina��o
 * @constructor
 * @param {Object} dwr_facade Objeto Creator do DWR que funciona como uma fachada
 * @param {Object} dwr_filter Objeto que serve como um Filtro para uma "Query By Example"
 * @param {Object} dwr_errorHandler Function personalizada para tratamento de erro do DWR
 * @since 0.1
 * @version 0.1
 * @copyright Milfont.org
 */
Ext.data.DWRProxySimple = function(dwr_facade, dwr_filter, dwr_errorHandler){
    Ext.data.DWRProxySimple.superclass.constructor.call(this);
    this.data = dwr_facade;
	this.dwr_filter = dwr_filter;
	this.dwr_errorHandler = dwr_errorHandler;
};

/**
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o mecanismo de extens�o do ExtJS
 */
Ext.extend(Ext.data.DWRProxySimple, Ext.data.DataProxy, {
	
	/**
     * Load data from the requested source (in this case an in-memory
     * data object passed to the constructor), read the data object into
     * a block of Ext.data.Records using the passed Ext.data.DataReader implementation, and
     * process that block using the passed callback.
     * @method load
     * @param {Object} params This parameter is not used by the MemoryProxy class.
     * @param {Ext.data.DataReader) reader The Reader object which converts the data
     * object into a block of Ext.data.Records.
     * @param {Function} callback The function into which to pass the block of Ext.data.records.
     * The function must be passed <ul>
     * <li>The Record block object</li>
     * <li>The "arg" argument from the load function</li>
     * <li>A boolean success indicator</li>
     * </ul>
     * @param {Object} scope The scope in which to call the callback
     * @param {Object} arg An optional argument which is passed to the callback as its second parameter.
     */
    load : function(params, reader, callback, scope, arg) {
		/**
		 * Escopo "this" mapeado para a vari�vel s porque dentro do callback do DWR o escopo "this"
		 * n�o pertence a classe.
		 */
		var s = this; 
        params = params || {};
		
		if(params.filter != undefined) {
			this.dwr_filter = params.filter;
		}
		
        var result;
        try {
			this.data(this.dwr_filter, {
				callback:function(response) {
					//alert(response.toSource());
					result = reader.readRecords(response);
					callback.call(scope, result, arg, true);
				},
				errorHandler:function(a, e) {
					scope.fireEvent("loadexception", s, arg, null, e);
					s.dwr_errorHandler(a);
				},
				timeout:100000
			});
			this.dwr_total_cache = true;
        } catch(e) {
            this.fireEvent("loadexception", this, arg, null, e);
            callback.call(scope, null, arg, false);
            return;
        }
       
    }
	
});

Ext.namespace("Ext.ux");
/**
 * @class Ext.ux.DWRTreeLoader
 * @extends Ext.tree.TreeLoader
 * @author Carina Stumpf
 *
 * DWRTreeloader loads tree nodes by calling a DWR service.
 * Version 2.1
 *
 */

/**
 * @constructor
 * @param cfg {Object} config A config object
 *    @cfg dwrCall the DWR function to call when loading the nodes
 */

Ext.ux.DWRTreeLoader = function(config) {
  Ext.ux.DWRTreeLoader.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.DWRTreeLoader, Ext.tree.TreeLoader, {
/**
 * Load an {@link Ext.tree.TreeNode} from the DWR service.
 * This function is called automatically when a node is expanded, but may be used to reload
 * a node (or append new children if the {@link #clearOnLoad} option is false.)
 * @param {Object} node node for which child elements should be retrieved
 * @param {Function} callback function that should be called before executing the DWR call
 */
  load : function(node, callback) {
    var cs, i;
    if (this.clearOnLoad) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    if (node.attributes.children && node.attributes.hasChildren) { // preloaded json children
      cs = node.attributes.children;
      for (i = 0,len = cs.length; i<len; i++) {
        node.appendChild(this.createNode(cs[i]));
      }
      if (typeof callback == "function") {
        callback();
      }
    } else if (this.dwrCall) {
      this.requestData(node, callback);
    }
  },

/**
 * Performs the actual load request
 * @param {Object} node node for which child elements should be retrieved
 * @param {Function} callback function that should be called before executing the DWR call
 */
  requestData : function(node, callback) {
    var callParams;
    var success, error, rootId, dataContainsRoot;

    if (this.fireEvent("beforeload", this, node, callback) !== false) {

      callParams = this.getParams(node);

      success = this.handleResponse.createDelegate(this, [node, callback], 1);
      error = this.handleFailure.createDelegate(this, [node, callback], 1);

      callParams.push({callback:success, errorHandler:error});

      this.transId = true;
      this.dwrCall.apply(this, callParams);
    } else {
      // if the load is cancelled, make sure we notify
      // the node that we are done
      if (typeof callback == "function") {
        callback();
      }
    }
  },

/**
 * Override this to add custom request parameters. Default adds the node id as first and only parameter
 */
  getParams : function(node) {
    return [node.id];
  },

/**
 * Handles a successful response.
 * @param {Object} childrenData data that was sent back by the server that contains the child nodes
 * @param {Object} parent parent node to which the child nodes will be appended
 * @param {Function} callback callback that will be performed after appending the nodes
 */

  handleResponse : function(childrenData, parent, callback) {
    this.transId = false;
    this.processResponse(childrenData, parent, callback);
	this.fireEvent("load", this, parent, childrenData);
  },

/**
 * Handles loading error
 * @param {Object} response data that was sent back by the server that contains the child nodes
 * @param {Object} parent parent node to which child nodes will be appended
 * @param {Function} callback callback that will be performed after appending the nodes
 */
  handleFailure : function(response, parent, callback) {
    this.transId = false;
    this.fireEvent("loadexception", this, parent, response);
    if (typeof callback == "function") {
      callback(this, parent);
    }
    console.log(e)("DwrTreeLoader: error during tree loading. Received response: " + response);
  },

/**
 * Process the response that was received from server
 * @param {Object} childrenData data that was sent back by the server that contains the attributes for the child nodes to be created
 * @param {Object} parent parent node to which child nodes will be appended
 * @param {Function} callback callback that will be performed after appending the nodes
 */
  processResponse : function(childrenData, parent, callback) {
    var i, n, nodeData;
    try {
      for (var i = 0; i<childrenData.length; i++) {
        var n = this.createNode(childrenData[i]);
        if (n) {
          n.hasChildren = childrenData[i].hasChildren;
          parent.appendChild(n);
        }
      }

      if (typeof callback == "function") {
        callback(this, parent);
      }
    } catch(e) {
      this.handleFailure(childrenData);
    }
  }
});

Ext.ux.BasicForm = Ext.extend(Ext.form.BasicForm, {
	json:{},
	getValues : function(){
		this.json = {};
		var getValuesRecursive = this.getValuesRecursive;
		var json = this.json;
		this.items.each(function(f){
			if(f.isFormField) {
				console.log('id > |'+f.pojo+'| e valor > '+ f.getValue());
				var jsonTemp = {};
				if(f.getValue() == undefined) {
					jsonTemp = makeJsonFromText(f.pojo, '');
				} else {
					jsonTemp = makeJsonFromText(f.pojo, f.getValue());
				}
            	merge(json, jsonTemp)
			}
		});
		this.json = json;
		return this.json;
    },
	findField : function(id){
		var field = null;
		this.items.each(function(f){
			if(f.isFormField && f.pojo == id) {
				field = f;
                return false;
			}
		});
        return field || null;
    },
	setValuesRecursive:function(values, obj) {
		var field, id;
		for(id in values){
			var ident = id;
			var value = values[id];
			if(obj) {ident = obj+"."+ident;}
			if(typeof value == "object") {
				this.setValuesRecursive(value, ident);
			}
            if(typeof value != 'function' && (field = this.findField(ident))){
				//alert("Bean montado: [" + id + "] valor? [" +value+ "]" + " pojoID: " + field.pojo);
                field.setValue(value);
                if(this.trackResetOnLoad){field.originalValue = field.getValue();}
            }
        }
	},
	loadRecord : function(record){
		this.setValuesRecursive(record.data);
        return this;
    }
});

Ext.ux.FormPanel = Ext.extend(Ext.FormPanel, {
	createForm: function(){
        delete this.initialConfig.listeners;
        return new Ext.ux.BasicForm(null, this.initialConfig);
    },
	initComponent: function(){
        Ext.ux.FormPanel.superclass.initComponent.call(this);
		this.form = this.createForm();
    }
});
Ext.reg('uxform', Ext.ux.FormPanel);
