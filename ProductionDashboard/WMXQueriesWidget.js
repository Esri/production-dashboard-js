/**
 * COPYRIGHT 2013 ESRI
 *
 * TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 * Unpublished material - all rights reserved under the
 * Copyright Laws of the United States and applicable international
 * laws, treaties, and conventions.

 * For additional information, contact:
 * Environmental Systems Research Institute, Inc.
 * Attn: Contracts and Legal Services Department
 * 380 New York Street
 * Redlands, California, 92373
 * USA

 * email: contracts@esri.com
 */

/**
* Run Query, 
* count records for the same value of "Value Field"
* for each value label with the "Label Field"
*/
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
  "dojo/_base/array", 
  "dijit/registry",
	"dojo/dom-construct",
  "dojo/dom-class",
	"dojo/dom-style",
  "dojo/Evented",
  "dijit/form/DropDownButton",
  "dojo/store/Memory", 
  "dijit/tree/ObjectStoreModel",
  "dijit/Tree",
  "esri/productiondashboard/PDWidget",
  "esri/productiondashboard/WMXRequest"
  
 ],
 function(declare, 
 		 lang,
     arrayUtils,
     registry,
 		 domConstruct,
 		 domClass,
 		 domStyle,
 		 Evented,
 		 DropDownButton,
 		 Memory,
 		 ObjectStoreModel, 		 
 		 Tree,
 		 PDWidget,
 		 WMXRequest,
 		 ColorPaletteWidget){

 	(function (){
  		var css = [
                  require.toUrl("esri/productiondashboard/mp-dashboard.css")
                ];
                var head = document.getElementsByTagName("head").item(0), link;
                for (var i = 0, il = css.length; i < il; i++) {
                    link = document.createElement("link");
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.href = css[i].toString();
                    head.appendChild(link);
                }
  	}());

  	return declare("esri.productiondashboard.WMXQueriesWidget", [PDWidget, Evented], {
  		baseClass : 'WMXQueriesWidget',  	
  		templateString: '<span class="${baseClass}">' +
      						    '<span  class="wmxDropDownButton" data-dojo-type="dijit/form/DropDownButton" data-dojo-attach-point="selectedNodeButton">' +
          						   '<span ><span class="wmxLabel">Queries</span></span>' +          						
          						   '<span data-dojo-type="dijit/layout/ContentPane" class="wmxQueriesTreeContainer"><label data-dojo-attach-point="status">${initialStatusMsg}</label><span data-dojo-attach-point="treeContainer"></span></span>' +
        					     '</span>' + 
    					       '</span>',
      //<!--span data-dojo-attach-point="tree"></span-->
  		initialStatusMsg: 'Loading...',

  		wmxRequest: null,

      queries: {"id":"root" , "type": "root", "name":"All Queries", "children":[]},

      selectedQuery: null,

      tree: null,

      postMixInProperties: function(){
      	this.inherited(arguments);
      }, 
    
    	buildRendering: function(){
            this.inherited(arguments); 
            this.load();
        },      
    
        postCreate: function(){
          this.inherited(arguments);          
      	},
        
        load:function(){         
          //this.tree.innerHTML = "";
          //this.queries = {"id":"root" , "type": "root", "name":"All Queries", "children":[]};
          this.treeContainer.innerHTML = '';
          if (this.wmxRequest == undefined){
              this.emit("error", "No WMX Service has been set");
              this.status.innerHTML = "<strong>No WMX Service has been set!</strong>"
            } else {
              if (this.wmxRequest instanceof WMXRequest) {
                try 
                {
                  this.wmxRequest.getContainers(
                  lang.hitch(this,function(data){
                        this.loadTree(data);                
                  }),
                  lang.hitch(this,function(error){
                       this.emit("error", "Error encountered with WMXRequest object");
                       this.status.innerHTML = "<strong>Error encountered with WMXRequest object</strong>";
                       
                }));                  

                } 
                catch (err){
                  this.emit("error", "Error encountered with WMXRequest object");
                  this.status.innerHTML = "<strong>Error encountered with WMXRequest object</strong>"     
                }

              } else {
                this.emit("error", "No WMX Request Object found");
                this.status.innerHTML = "<strong>No WMX Request Object found!</strong>" 
              }
            }
        },  

      	loadTree: function(data){
      		//console.log(data);                  
          if (data instanceof Array){
            for (var i =0;i<data.length;i++){            
               this.addContainer(data[i]);
             }            
            }
            console.log(this.queries);
            var memory = new Memory(
                 {
                   data:[ this.queries ] , 
                   getChildren: function(object){
                      return object.children || [];
                   }
            });
            
            var osModel = new ObjectStoreModel(
                          {
                            store: memory,  
                            query: {id: 'root'},                         
                            mayHaveChildren: function(item){
                              return "children" in item;
                            }
                          });

            if (this.tree) 
              registry.remove(this.tree);
            this.tree = domConstruct.create('div', {}, this.treeContainer)

            this.tree = new Tree(
                 { 
                  model: osModel,
                  onClick: lang.hitch(this, this.treeClickEvent)
                },this.tree);
            this.tree.startup();
            //registry.remove(this.status);            
            this.status.innerHTML = '';
            this.selectedNodeButton.set('label','Select a Query');
            this.emit("loaded", this.selectedQuery);
          },

        addContainer:function(container, parent){
          if (container){
            if (parent == undefined) parent = 'root';
            var c = {
                      id: container.id, 
                      type: 'container', 
                      name:container.name, 
                      parent: parent, 
                      children:[]
                    };
            this.queries.children.push(c)
            if (container.queries){
               this.addContainerQueries(c, container.queries, container.id)
            }
            if (container.containers){
              var parent = container.id
              arrayUtils.forEach(container.containers, lang.hitch(this, function(container){
                this.addContainer(container, parent);
              }));
            } 
          }          
        },


        addContainerQueries: function(container, queries, parent){
          if (queries){
            if (parent == undefined) parent = 'root';
            arrayUtils.forEach(queries, lang.hitch(this, function(query){
              var q = {
                        id: query.id, 
                        type:'query', 
                        name: query.name,
                        parent: parent
                      };
              container.children.push(q);
            }));
          }
        },

        treeClickEvent: function(e){      
          if (e.type == 'query' ) {
            this.selectedQuery = e;
          } else {
            this.selectedQuery = null;
          }
          this.selectedNodeButton.set('label',e.name);
          this.selectedNodeButton.closeDropDown();
          this.emit("selected", e);          
        },

        setSelectedQuery: function(id){
           this.selectedQuery =  this._findNode(this.queries.children, id,'query');
           if (this.selectedQuery != undefined){
              this.selectedNodeButton.set('label',this.selectedQuery.name);
              var path = this.getNodePath(id, 'query');
              if (path.length > 0 && this.tree){
                 this.tree.set('paths', [path]);
               }
           }           
        },
        
        getNodePath: function(id, type){
          var path = [id.toString()];
          var node = this._findNode(this.queries.children, id,type);
          while (node != undefined && node.parent != 'root'){
            path.push(node.parent.toString())
            node = this._findNode(this.queries.children, node.parent, 'container')
          }
          if (node != undefined){
             path.push(node.parent.toString());
          }
          return (path.length > 0)? path.reverse(): path;
        },

        _findNode: function(nodes,id, type){
          if (nodes == undefined ) return null;
          if (nodes instanceof Array){
            for(var i = 0;i<nodes.length;i++){
              var node = nodes[i];
              if (node.id == id && node.type == type){
                return node;
              } else{
                if (node.children != undefined && 
                    node.children instanceof Array &&
                    node.children.length > 0){
                  var n = this._findNode(node.children, id, type);
                  if (n != undefined)  return n;
                }
              }
            }
          }
          return null;
          
        }



    });
});
