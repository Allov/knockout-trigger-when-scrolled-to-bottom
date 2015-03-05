define(['knockout', 'jquery'],
    function(ko, $) {
        'use strict';

        var handlerId = 0;

        //TODO: http://stackoverflow.com/questions/10324240/knockout-binding-handler-teardown-function (voir 2ieme réponse..?) (sur tous les bindings)
        ko.bindingHandlers.triggerWhenScrolledToBottom = {

            //ko.utils.domData.get(element, key)
            //ko.utils.domData.set(element, key, value)
            //ko.utils.domData.clear(element)
            init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var action = ko.utils.unwrapObservable(valueAccessor());
                var options = getOptions(allBindingsAccessor);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    unregisterScrollEventIfRegistered(element, options);
                });

                if (!ko.utils.unwrapObservable(options.disabled) && isScrolledIntoView(element, options)) {
                    executeAction(element, viewModel, action);
                }
            },

            update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
                var action = ko.utils.unwrapObservable(valueAccessor());
                var options = getOptions(allBindingsAccessor);

                if (ko.utils.unwrapObservable(options.disabled)) {
                    unregisterScrollEventIfRegistered(element, options);
                } else {
                    registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel);
                }
            }
        };

        //TODO: debounce!!!
        function registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel) {
            var isRegistered = ko.utils.domData.get(element, options.handler);

            if (!isRegistered) {
                ko.utils.domData.set(element, options.handler, true);

                $(options.useParent ? $(element).parent() : window).on('scroll.ko.' + options.handler, function(data, event) {
                    if (isScrolledIntoView(element, options)) {
                        executeAction(element, viewModel, action, data, event);
                    }
                });
            }
        }

        function getOptions(allBindingsAccessor) {
            return $.extend({
                disabled: false,
                useParent: false,
                handler: 'scrollHandler' + (++handlerId)
            }, allBindingsAccessor().triggerWhenScrolledToBottomOptions);
        }

        function unregisterScrollEventIfRegistered(element, options) {
            var isRegistered = ko.utils.domData.get(element, options.handler);

            if (isRegistered) {
                ko.utils.domData.set(element, options.handler, null);
                $(options.useParent ? $(element).parent() : window).off('scroll.ko.' + options.handler);
            }
        }

        function executeAction(element, viewModel, action, data, event) {
            if (typeof action === 'string' || action instanceof String) {
                $(element).trigger(action);
            } else {
                action.call(viewModel, data, event);
            }
        }

        function isScrolledIntoView(element, options) {
            if (options.useParent) {
                var $parent = $(element).parent();
                return $parent.scrollTop() + $parent.innerHeight() >= $parent[0].scrollHeight;
            } else {
                var docViewTop = $(window).scrollTop();
                var docViewBottom = docViewTop + $(window).height() + (ko.utils.unwrapObservable(options.offset) || 0);
                var elemTop = $(element).offset().top;
                var elemBottom = elemTop + $(element).height();

                return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            }
        }
    });
