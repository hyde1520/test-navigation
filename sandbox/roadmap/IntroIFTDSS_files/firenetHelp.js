/** Iftdss Help Functions - Functions to open page and context MadCap Flare Help
 */
    
/**
 * getIftdssContextHelp function
 *   @param helpIdAlias - alias name from the Alias.js file
 */
getIftdssContextHelp = function(helpIdAlias)
{
    //var helpId = topicHelp[helpIdAlias];
    //FMCOpenHelp('s_flammap_fm', null, null, null, null);
    FMCOpenHelp(helpIdAlias, null, null, null, null);
}

/**
 * setIftdssHoverText function
 *   @param hoverJson - The json string that represents the
 *   hover text for a page (element ids and title text strings)
 */
setIftdssHoverText = function(group, hoverJson)
{
    //var hoverEntries = JSON.parse(hoverJson);
    var hoverArray = hoverJson[group];
    for (i=0; i<hoverArray.length; i++) {
        var id = document.getElementById(hoverArray[i].id);
        if (id != null) {
            var title = id.title;
            var text = hoverArray[i].text;
            id.title = text;
        }
    }
}


$( document ).ready(function() {

    /*
    *
    *
    *
    * HELP POPOVERS
    *
    *
    *
    */
    $(document).on('click', '.popover-btn', function (e) {
        console.log('popOver Clicked');
        var id = $(this).data('helpid');
        var helpObj = PopOverHelpers.getPath(id);
        console.log(helpObj);
        if(id != null &&  id != undefined &&  helpObj != null &&  helpObj != undefined){
            
            var content = '<iframe id="hp'+id+'" class="helpFrame" src="'+PopOverHelpers.root+helpObj.location+'" frameborder="0" scrolling="yes"></iframe>' +
            '<div id="spin'+id+'" class="innerloader popup-spinner spinner spinner--black">' +
                '<div class="spinner__item1"></div>' +
                '<div class="spinner__item2"></div>' +
                '<div class="spinner__item3"></div>' +
                '<div class="spinner__item4"></div>' +
            '</div>' + 
            '<div class="clearfix"></div>';
            $(this).popover({
                container: 'body',
                content: content,
                html:'true',
                placement:'auto',
                trigger:'focus',
                template: '<div class="popover iftdssHelpPopover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content single"></div></div>',
            }).popover('show');

            document.getElementById('hp'+id).onload = function() {
                //Remove Pending
                $('#spin'+id).remove();
            }
        }
    });
    $(document).on('click','#startTour',function(e){
        // console.log('start tour');
        var p = $('.popover-btn');
        var pL = p.length;
        if(!pL){   
            return false;
        }
        var steps = [];
        //add to tour conditional Flag
        var flag = true;
        for (var i = 0; i < pL; i++) {
            var el = p[i];
            var id = $(el).data('helpid');
            //see if pop over in a pane
            var panes = $(el).parents('.tab-pane');
            var panesL = panes.length;
            // console.log(panesL);
            if (panesL) {
                for (var j = 0; j < panesL; j++) {
                    var par = panes[j];
                    if ( !$(par).hasClass("in") ) {
                        flag = false;
                    }
                };
            }
            // console.log(flag);
            var helpObj = PopOverHelpers.getPath(id);
            // console.log(helpObj);
            if(flag == true && (id != null || id != undefined || helpObj != null || helpObj != undefined)){
                var elStep = {};
                elStep.element = el;
                elStep.content = '<iframe id="tp'+i+'"" class="helpFrame" src="'+PopOverHelpers.root+helpObj.location+'" frameborder="0" scrolling="yes"></iframe>',
                elStep.backdropElement = $(el).closest('.panel');
                //Check to see if this el is beside a collapse el
                var sib = $(el).siblings('[data-toggle="collapse"]').eq(0);
                if (sib != undefined && (sib.hasClass('collapsed') || (sib.data('toggle') == 'collapse'))) {
                    elStep.onShown = function (tour) {
                        var sib = $('.tour-tour-element').siblings('[data-toggle="collapse"]').eq(0);
                        var target = (sib.data('target') == undefined)? sib.attr('href'):sib.data('target');
                        if(target !== undefined && !$(target).hasClass("in")){
                            sib.trigger("click");
                        }
                    }
                }
                steps.push(elStep);
            }
            flag = true;
        };
        // console.log(steps.length);
        if(steps.length){   
            var tour = new Tour({
                steps:steps,
                storage:false,
                backdrop:true,
                onStart : function(tour){
                    $('.popover-btn').popover('destroy');
                },
               template: '<div class="popover iftdssHelpPopover" role="tooltip"> <div class="arrow"></div> <h3 class="popover-title"></h3> <div class="popover-content"></div> <div class="popover-navigation"> <div class="btn-group"> <button class="btn btn-sm btn-default" data-role="prev">&laquo; Prev</button> <button class="btn btn-sm btn-default" data-role="next">Next &raquo;</button> <button class="btn btn-sm btn-default" data-role="pause-resume" data-pause-text="Pause" data-resume-text="Resume">Pause</button> </div> <button class="btn btn-sm btn-default" data-role="end">End tour</button> </div> </div>',
               // debug:true,
            });
            tour.init();
            tour.start();
        }
    });

    /*
    *
    *
    *
    * END HELP POPOVERS
    *
    *
    *
    */

//=========================================================================================
    // PopOverHelpers.init('//rjgoolsby.github.io/iftdss-test');
    PopOverHelpers.init('https://hyde1520.github.io/test-navigation');
});

var PopOverHelpers = {
    list: new Array(),
    contentList: null,
    helpSystemPath: 'Data/HelpSystem.xml',
    aliasPath: 'Data/Alias.xml',
    root:'',
    init: function (root) {
        if(root != undefined){
            PopOverHelpers.root = root;
            PopOverHelpers.helpSystemPath = root+'/'+'Data/HelpSystem.xml';
            PopOverHelpers.aliasPath = root+'/'+'Data/Alias.xml';
        }
        $.get(PopOverHelpers.aliasPath, function( d ) {
            var p = d.getElementsByTagName("Map");
            var pl = p.length;
            for (var m = 0; m < pl; m++) {
                var id = p[m].getAttribute("ResolvedId");
                var name = p[m].getAttribute("Name");
                var location = p[m].getAttribute("Link");
                PopOverHelpers.list[id] = {
                    name : p[m].getAttribute("Name"),
                    location : '/content/' + p[m].getAttribute("Link"),
                };
            }
        });
    },
    getPath:function(id){
        return PopOverHelpers.list[id];
    }
}