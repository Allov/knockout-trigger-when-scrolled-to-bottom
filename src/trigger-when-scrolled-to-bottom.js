define(['knockout', 'jquery'], function(ko, $) {
    'use strict';
    //TODO: http://stackoverflow.com/questions/10324240/knockout-binding-handler-teardown-function (voir 2ieme réponse..?) (sur tous les bindings)
    ko.bindingHandlers.triggerWhenScrolledToBottom = {

        //ko.utils.domData.get(element, key)
        //ko.utils.domData.set(element, key, value)
        //ko.utils.domData.clear(element)
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                unregisterScrollEventIfRegistered(element);
            });

            var action = ko.utils.unwrapObservable(valueAccessor());
            var options = getOptions(allBindingsAccessor);

            if (!ko.utils.unwrapObservable(options.disabled) && isScrolledIntoView(element, options)) {
                executeAction(element, viewModel, action);
            }
        },

        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var action = ko.utils.unwrapObservable(valueAccessor());
            var options = getOptions(allBindingsAccessor);

            if (ko.utils.unwrapObservable(options.disabled)) {
                unregisterScrollEventIfRegistered(element);
            } else {
                registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel);
            }
        }
    };

    //TODO: debounce!!!
    function registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel) {
        var isRegistered = ko.utils.domData.get(element, 'scrollHandler');

        if (!isRegistered) {
            ko.utils.domData.set(element, 'scrollHandler', true);

            $(window).on('scroll.ko.scrollHandler', function(data, event) {
                if (isScrolledIntoView(element, options)) {
                    executeAction(element, viewModel, action, data, event);
                }
            });
        }
    }

    function getOptions(allBindingsAccessor){
        return $.extend({
            disabled: false
        }, allBindingsAccessor().triggerWhenScrolledToBottomOptions);
    }

    function unregisterScrollEventIfRegistered(element) {
        var isRegistered = ko.utils.domData.get(element, 'scrollHandler');

        if (isRegistered) {
            ko.utils.domData.set(element, 'scrollHandler', null);
            $(window).off('scroll.ko.scrollHandler');
        }
    }

    function executeAction(element, viewModel, action, data, event){
        if(typeof action === 'string' || action instanceof String){
            $(element).trigger(action);
        }else{
            action.call(viewModel, data, event);
        }
    }

    function isScrolledIntoView(elem, options) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom + (ko.utils.unwrapObservable(options.offset) || 0) <= docViewBottom) && (elemTop >= docViewTop));
    }
});
