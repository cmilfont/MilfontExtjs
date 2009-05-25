/*
 * Assegurar que o Namespace para extensão será reconhecido
 */
Ext.namespace("Ext.ux.data");

/**
 * @author Christiano Milfont
 * @class
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o mecanismo de extensão do ExtJS
 * @classDescription  Objeto que funciona como um Proxy [ver Design pattern Proxy], que
 * é um mecanismo de captura de dados remotos, integrado ao Framework/Engine DWR.
 * @constructor
 * @param {Object} dwr_facade Objeto Creator do DWR que funciona como uma fachada
 * @param {Object} dwr_filter Objeto que serve como um Filtro para uma "Query By Example"
 * @param {Object} dwr_errorHandler Function personalizada para tratamento de erro do DWR
 * @since 0.1
 * @version 0.5
 * @copyright Milfont.org
 */
Ext.ux.data.DWRProxy = function(dwr_facade, dwr_filter, dwr_errorHandler){
    Ext.ux.data.DWRProxy.superclass.constructor.call(this);
	/* Propriedade que receberá a classe Java configurada como Creator */
    this.data = dwr_facade;
	/*
	 * Propriedade que receberá uma classe java configurada como converter
	 * que servirá como filtro de busca
	 */
	this.dwr_filter = dwr_filter;
	/**
	 *
	 * Propriedade para fazer paginação, indica que deve cachear a consulta de
	 * total de elementos o controlador [fachada] deve implementar a logica de
	 * negocios adequada, quando for false consulta o total, quando for true
	 * consulta apenas a listagem e repete o total
	 * @since 0.4
	 */
	this.dwr_total_cache = false;
	/**
	 * @since 0.5
	 */
	this.dwr_errorHandler = dwr_errorHandler;
};

/**
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o mecanismo de extensão do ExtJS
 */
Ext.extend(Ext.ux.data.DWRProxy, Ext.data.DataProxy, {

	/**
     * Método Load do Ext.data.DataProxy overrided
     */
    load : function(params, reader, callback, scope, arg) {
		/**
		 * Escopo "this" mapeado para a variável "s" porque dentro do callback do
		 * DWR o escopo "this" não pertence ao objeto Ext.ux.data.DWRProxy.
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
 * @extends Ext.data.DWRProxySimple O objeto DWRProxy extende de DataProxy com o mecanismo de extensão do ExtJS
 *
 * @classDescription  Objeto que funciona como um Proxy [ver Design pattern Proxy], que
 * É um mecanismo de captura de dados remotos, integrado ao Framework/Engine DWR. Esse funciona sem paginação
 * @constructor
 * @param {Object} dwr_facade Objeto Creator do DWR que funciona como uma fachada
 * @param {Object} dwr_filter Objeto que serve como um Filtro para uma "Query By Example"
 * @param {Object} dwr_errorHandler Function personalizada para tratamento de erro do DWR
 * @since 0.1
 * @version 0.1
 * @copyright Milfont.org
 */
Ext.ux.data.DWRProxySimple = function(dwr_facade, dwr_filter, dwr_errorHandler){
    Ext.ux.data.DWRProxySimple.superclass.constructor.call(this);
    this.data = dwr_facade;
	this.dwr_filter = dwr_filter;
	this.dwr_errorHandler = dwr_errorHandler;
};

/**
 * @extends Ext.data.DataProxy O objeto DWRProxy extende de DataProxy com o
 * mecanismo de extensão do ExtJS
 */
Ext.extend(Ext.ux.data.DWRProxySimple, Ext.data.DataProxy, {

	/**
     * Método Load do Ext.data.DataProxy overrided
     */
    load : function(params, reader, callback, scope, arg) {
		/**
		 * Escopo "this" mapeado para a variável 's' porque dentro do callback
		 * do DWR o escopo "this" nao pertence ao objeto Ext.ux.data.DWRProxy.
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

