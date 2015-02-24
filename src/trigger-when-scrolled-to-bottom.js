define(['knockout', 'jquery'], function(ko, $) {
    "use strict";
    //TODO: http://stackoverflow.com/questions/10324240/knockout-binding-handler-teardown-function (voir 2ieme réponse..?) (sur tous les bindings)
    ko.bindingHandlers.triggerWhenScrolledToBottom = {

        //ko.utils.domData.get(element, key)
        //ko.utils.domData.set(element, key, value)
        //ko.utils.domData.clear(element)
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                unregisterScrollEventIfRegistered(element);
            });
            
            var settings = allBindingsAccessor().triggerWhenScrolledToBottomOptions;

            if (isScrolledIntoView(element)) {
                executeAction(element, viewModel, settings, event);
            }
        },

        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var mayScroll = ko.utils.unwrapObservable(valueAccessor());
            var settings = allBindingsAccessor().triggerWhenScrolledToBottomOptions;

            if (mayScroll) {
                registerScrollEventIfNotAlreadyRegistered(element, settings, viewModel);
            } else {
                unregisterScrollEventIfRegistered(element);
            }
        }
    };


    //TODO: offset
    //var offset = settings.offset ? settings.offset : "0";

    //TODO: debounce!!!
    function registerScrollEventIfNotAlreadyRegistered(element, settings, viewModel) {
        var isRegistered = ko.utils.domData.get(element, 'scrollHandler');

        if (!isRegistered) {
            ko.utils.domData.set(element, 'scrollHandler', true);

            $(window).on("scroll.ko.scrollHandler", function(data, event) {
                if (isScrolledIntoView(element)) {
                    executeAction(element, viewModel, settings.action, data, event);
                }
            });
        }
    }

    function unregisterScrollEventIfRegistered(element) {
        var isRegistered = ko.utils.domData.get(element, 'scrollHandler');

        if (isRegistered) {
            ko.utils.domData.set(element, 'scrollHandler', null);
            $(window).off("scroll.ko.scrollHandler");
        }
    }

    function executeAction(element, viewModel, action, data, event){
        if(typeof action === 'string' || action instanceof String){
            $(element).trigger(action);
        }else{
            action.call(viewModel, data, event);
        }
    }

    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
});