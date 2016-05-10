$(function() {
  buildApi();
  buildNav();
});



function buildNav() {
  var root = {
    children: []
  },
  parent = root;

  $('section').each(function() {
    var section = $(this);

    var heading = section.children('h2, h3');

    if (!heading.text().length) {
      return;
    }

    var navItem = {
      id: section.attr('id'),
      text: heading.attr('data-menu-name') || heading.text(),
      children: [],
    };

    if ('H3' === heading.prop('tagName')) {
      parent.children.push(navItem);
    } else {
      root.children.push(navItem);
      parent = navItem;
    }
  });

  __buildNav = function(nodeList) {
    if (!nodeList.length) {
      return '';
    }

    var html = '<ul>';

    nodeList.forEach(function(node) {
      html += '<li>';

      html += '<a href="#' + node.id + '">' + node.text + '</a>';

      html += __buildNav(node.children);

      html += '</li>';
    });

    return html + '</ul>';
  };

  var $nav = $('nav');
  $nav.append(__buildNav(root.children));

  $('main section')
    .on('scrollSpy:enter', function() {
      var id = this.id;

      $nav.find('a').each(function() {
        var $a = $(this),
          aId = $a.attr('href').substr(1);

        if (aId === id) {
          $a.closest('li').addClass('active');
        } else {
          $a.closest('li').removeClass('active');          
        }
      });
    })
    .scrollSpy();
};




function buildApi() {

  var __slugify = function(str) {
    return 'api_' + str.toLowerCase().replace('/[\s\.]+/igm', '_');
  };


  var __generateSig = function(params) {
    return '(' + (params ? Object.keys(params).join(', ') : '') + ')';
  };


  var __processTxt = function(str) {
    // turn links into real links
    return str
      .replace(/\[\[(.+?)\]\]/igm, function (match, capture) { 
        return '<a href="#' + __slugify(capture) + '">' + capture + '</a>';
      })
      .replace(/\[(.+?)\]\((.+?)\)/igm, '<a href="$2">$1</a>')
      .replace(/\`(.+?)\`/igm, '<code>$1</code>')
  };


  var __processTypes = function(types) {
    var str = types.map(function(t) {
      return '<code>' + __processTxt(t) + '</code>';
    }).join(' or ');

    return $('<span class="type">' + str + '</span>');
  };


  var __processParams = function(parentName, paramsObj) {
    if (1 === arguments.length) {
      paramsObj = parentName;
      parentName = null;
    }

    var $ul = $('<ul/>');

    for (var key in paramsObj) {
      var node = paramsObj[key],
        nodeName = (parentName ? parentName + '.' : '') + key;

      var $li = $('<li />');
      if (!node.defaultValue) {
        $li.addClass('required');
      }

      $li.append('<span class="name">' + nodeName + '</span>');
      $li.append(__processTypes(node.type));
      if (node.defaultValue) {
        $li.append('<code class="default">' + __processTxt(node.defaultValue) + '</code>');
      }
      $li.append('<span class="desc">' + __processTxt(node.desc) + '</span>');

      if (node.params) {
        $li.append(__processParams(nodeName, node.params));
      }

      $ul.append($li);
    }

    return $ul;
  };


  var __processFunction = function($dl, parentNodeName, key, node) {
    var $dt = $('<dt>.' 
      + key 
      + ' ' 
      + (node.gen ? '* ' : '')
      + __generateSig(node.params) 
      + 
    '</dt>');
    
    if (node.static) { 
      $dt.addClass('static');
    }

    if ('constructor' === key) { 
      $dt.addClass('constructor');
    }

    $dt.attr('id', __slugify(parentNodeName + '.' + key));
    $dl.append($dt);

    $dd = $('<dd />');

    if (node.desc) {
      $dd.append('<div class="desc">' + __processTxt(node.desc) + '</div>');
    }

    if (node.params) {
      $params = $('<div class="params" />');
      $params.append('<label>Params:</label>');
      $params.append(__processParams(node.params));
      $dd.append($params);
    }

    if (node.ret) {
      var $ret = $('<div class="return"><label>Returns:</label></div>');
      $ret.append(__processTypes(node.ret.type));
      if (node.ret.desc && node.ret.desc.length) {
        $ret.append('<span class="desc">' + __processTxt(node.ret.desc) + '</span>');
      }
    }

    $dd.append($ret);

    $dl.append($dd);
  };


  var __processProperty = function($dl, parentNodeName, key, node) {
    var $dt = $('<dt />');
    $dt.append('<span class="name">.' + key + "</span>");
    $dt.append(__processTypes(node.type));
    $dt.attr('id', __slugify(parentNodeName + '.' + key));
    $dl.append($dt);

    $dd = $('<dd />');

    $dd.append('<span class="desc">' + __processTxt(node.desc) + '</span>');

    $dl.append($dd);
  };


  var __processApiNode = function(parentNodeName, parentObj) {
    var $dl = $('<dl />');

    for (var key in parentObj) {
      var node = parentObj[key];

      if (true === node.property) {
        __processProperty($dl, parentNodeName, key, node);
      } else {
        __processFunction($dl, parentNodeName, key, node);
      }
    }

    return $dl;
  };


  var $api = $('#api');

  for (var key in apiDocs) {
    var node = apiDocs[key];

    var $section = $('<section />');
    $section.attr('id', __slugify(key));

    var $h3 = $('<h3>' + key + '</h3>');
    $h3.attr('data-menu-name', node.menuName || key);
    $section.append($h3);

    $section.append(__processApiNode(key, node.children));

    $api.append($section);
  }
};



var apiDocs = {
  'Thinodium': {
    children: {
      connect: {
        static: true,
        params: {
          type: {
            type: ['String'],
            desc: 'Database engine type and/or NPM package name and/or path to CommonJS module.'
          },
          options: {
            type: ['Object'],
            defaultValue: '{}',
            desc: 'Connection options. Specifics depend on what the chosen database adapter expects.',
          },
        },
        ret: {
          type: ['Promise'],
          desc: 'Resolves to a database connection if successful.',
        },
        desc: 'Connect to a database',
      },
    },
  },
  'Thinodium.Database': {
    menuName: '.Database',
    children: {
      connect: {
        params: {
          connectionOptions: {
            type: ['Object'],
            desc: 'Connection options.',
            defaultValue: '{}',
          },
        },
        ret: {
          type: ['Promise'],
        },
        desc: 'Open a database connection.',
      },
      disconnect: {
        ret: {
          type: ['Promise'],
        },
        desc: 'Close this database connection.',
      },
      model: {
        params: {
          name: {
            type: ['String'],
            desc: 'Table name.'
          },
          config: {
            type: ['Object'],
            defaultValue: '{}',
            desc: 'Model configuration options, see [[Thinodium.Model]].',
          },
        },
        ret: {
          type: ['[[Thinodium.Model]]'],
          desc: 'The model.',
        },
        desc: 'Create a model instance for given database table.',
      },
      isConnected: {
        property: true,
        type: ['Boolean'],
        desc: '`true` if connected, `false` otherwise.',
      },      
    },
  },
  'Thinodium.Model': {
    menuName: '.Model',
    children: {
      constructor: {
        params: {
          db: {
            type: ['[[Thinodium.Database]]'],
            desc: 'Database connection.'
          },
          name: {
            type: ['String'],
            desc: 'Underlying table name.'
          },
          cfg: {
            type: ['Object'],
            defaultValue: '{}',
            desc: 'Configuration options',
            params: {
              schema: {
                type: ['Object'],
                defaultValue: '{}',
                desc: 'Database schema',
              },
              modelMethods: {
                type: ['Object'],
                defaultValue: '{}',
                desc: 'Prototype methods to add to this [[Thinodium.Model]] instance.',
              },
              docMethods: {
                type: ['Object'],
                defaultValue: '{}',
                desc: 'Prototype methods to add to any [[Thinodium.Document]] instances returned.',
              },
              docVirtuals: {
                type: ['Object'],
                defaultValue: '{}',
                desc: 'Virtual fields to add to any [[Thinodium.Document]] instances returned.',
              },
            },
          },
        },
      },
      'db': {
        property: true,
        type: ['[[Thinodium.Database]]'],
        desc: 'The parent database connection.'
      },
      'name': {
        property: true,
        type: ['String'],
        desc: 'Name of underlying db table.'
      },
      'pk': {
        property: true,
        type: ['String'],
        desc: 'Name of primary key.'
      },
      'schema': {
        property: true,
        type: ['Object'],
        desc: 'Schema validator instance, see `simple-nosql-schema` module.'
      },
      'init': {
        ret: {
          type: ['Promise'],
        },
        desc: 'Initialize this model, creating the database table and doing any other necessary work. This method usually gets called by the parent [[Thinodium.Database]] instance.',
      },
      'get': {
        params: {
          id: {
            type: ['Any'],
            desc: 'Primary key value',
          },
        },   
        ret: {
          type: ['Promise'],
          desc: 'Resolved with [[Thinodium.Document]] instance if found, `null` otherwise',
        },
        desc: 'Get document with given primary key value.',
      },
      'getAll': {
        ret: {
          type: ['Promise'],
          desc: 'Resolved with `Array` of [[Thinodium.Document]] instances',
        },
        desc: 'Get all documents.',
      },
      'insert': {
        params: {
          attrs: {
            type: ['Object'],
            desc: 'Document attributes',
          },
        },      
        ret: {
          type: ['Promise'],
          desc: 'Resolved with [[Thinodium.Document]] instance',
        },
        desc: 'Insert a document.',
      },
      'rawQry': {
        ret: {
          type: ['Object'],
          desc: 'Raw querying object from underlying db engine interface.',
        },
        desc: 'Get an object for executing raw queries.',
      },
      'rawGet': {
        params: {
          id: {
            type: ['Any'],
            desc: 'Primary key value',
          },
        },   
        ret: {
          type: ['Promise'],
          desc: 'Resolved with raw data if found, `null` otherwise',
        },
        desc: 'Get raw document with given primary key value.',
      },
      'rawGetAll': {
        ret: {
          type: ['Promise'],
          desc: 'Resolved with array of raw documents.',
        },
        desc: 'Get all documents.',
      },
      'rawInsert': {
        params: {
          attrs: {
            type: ['Object'],
            desc: 'Document attributes',
          },
        },      
        ret: {
          type: ['Promise'],
          desc: 'Resolved with inserted raw doc.',
        },
        desc: 'Insert a document.',
      },
      'rawUpdate': {
        params: {
          id: {
            type: ['Any'],
            desc: 'primary key id',
          },
          changes: {
            type: ['Object'],
            desc: 'Updated attributes',
          },
          document: {
            type: ['[[Thinodium.Document]]'],
            desc: 'Document instance associated with this row.',
            defaultValue: 'undefined',
          },
        },      
        ret: {
          type: ['Promise'],
        },
        desc: 'Update a document.',
      },
      'rawRemove': {
        params: {
          id: {
            type: ['Any'],
            desc: 'primary key id',
          },
        },      
        ret: {
          type: ['Promise'],
        },
        desc: 'Remove a document.',
      },        
      'wrapRaw': {
        params: {
          result: {
            type: ['Array', 'Object'],
            desc: 'Raw query result(s)',
          },
        },      
        ret: {
          type: ['Array', '[[Thinodium.Document]]'],
          desc: 'Wrapped result(s).',
        },
        desc: 'Wrap raw query result(s) in [[Thinodium.Document]] instance(s).',
      },        
    },
  },
  'Thinodium.Document': {
    menuName: '.Document',
    children: {
      constructor: {
        desc: 'Construct a document.',
        params: {
          model: {
            type: ['[[Thinodium.Model]]'],
            desc: 'The parent model',
          },
          doc: {
            type: ['Object'],
            desc: 'The raw document.',
            defaultValue: '{}'
          }
        }
      },
      addVirtual: {
        desc: 'Add a virtual field.',
        params: {
          key: {
            type: ['String'],
            desc: 'Name of field',
          },
          config: {
            type: ['Object'],
            desc: 'Field configuration.',
            params: {
              get: {
                type: ['Function'],
                desc: 'Field getter.',
                ret: {
                  type: ['Any'],
                  desc: 'The virtual field value.',
                },
              },
              set: {
                type: ['Function'],
                desc: 'Field setter.',
                defaultValue: 'undefined',
              },
            },
          },
        },
      },
      'markChanged': {
        desc: 'Mark one or more properties as having changed. This affects what properties get updated in the db when [[Thinodium.Document.save]] is called.',
        params: {
          '...keys': {
            type: ['Array'],
            desc: 'Names or properties to mark as having changed.'
          }
        }
      },
      'toJSON': {
        desc: 'Get JSON version of this document.',
        ret: {
          type: ['Object'],
          desc: 'JSON object.'
        },
      },
      'changes': {
        desc: 'Get changed properties.',
        ret: {
          type: ['Object'],
          desc: 'Changed properties and their new values.'
        },
      },
      'reset': {
        desc: 'Reset changed properties to original unmodified values.',
      },    
      'save': {
        desc: 'Persist changes made to this document.',
        ret: {
          type: ['Promise'],
        },
      },    
      'remove': {
        desc: 'Remove this document from the db.',
        ret: {
          type: ['Promise'],
        },
      },    
      'reload': {
        desc: 'Reload this document from the db, discarding any property changes made since it was first loaded.',
        ret: {
          type: ['Promise'],
        },
      },          
    },
  },
};


