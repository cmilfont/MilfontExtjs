var merge = (function merge(el, cp) {
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
});

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


Ext.ux.BasicForm = Ext.extend(Ext.form.BasicForm, {
    json:{},
    getValues : function(){
        this.json = {};
        var getValuesRecursive = this.getValuesRecursive;
        var json = this.json;
        this.items.each(function(f){
            if(f.isFormField) {
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