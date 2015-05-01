// Copyright (c) CBC/Radio-Canada. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

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
                setScrollHandlerIdFromElement(element);

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
            var isScrollHandlerRegistered = ko.utils.domData.get(element, 'isScrollHandlerRegistered');

            if (!isScrollHandlerRegistered) {
                ko.utils.domData.set(element, 'isScrollHandlerRegistered', true);

                $(options.useParent ? $(element).parent() : window)
                    .on(getScrollHandlerIdFromElement(element), function(data, event) {
                        if (isScrolledIntoView(element, options)) {
                            executeAction(element, viewModel, action, data, event);
                        }
                    });
            }
        }

        function getScrollHandlerIdFromElement(element) {
            return 'scroll.ko.' + ko.utils.domData.get(element, 'scrollHandlerId');
        }

        function setScrollHandlerIdFromElement(element) {
            ko.utils.domData.set(element, 'scrollHandlerId', 'scrollHandler' + (++handlerId));
        }

        function getOptions(allBindingsAccessor) {
            //TODO: Attention, triggerWhenScrolledToBottomOptions pourrait contenir des observables

            return $.extend({
                disabled: false,
                useParent: false,
                offset: 0
            }, allBindingsAccessor().triggerWhenScrolledToBottomOptions);
        }

        function unregisterScrollEventIfRegistered(element, options) {
            var isScrollHandlerRegistered = ko.utils.domData.get(element, 'isScrollHandlerRegistered');

            if (isScrollHandlerRegistered) {
                ko.utils.domData.set(element,'isScrollHandlerRegistered', null);
                $(options.useParent ? $(element).parent() : window).off(getScrollHandlerIdFromElement(element));
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
                var docViewBottom = docViewTop + $(window).height() + options.offset;
                var elemTop = $(element).offset().top;
                var elemBottom = elemTop + $(element).height();

                return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            }
        }
    });
