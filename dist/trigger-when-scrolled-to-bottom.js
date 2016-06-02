(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['knockout', 'jquery'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('knockout'), require('jquery'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.knockout, global.jquery);
        global.triggerWhenScrolledToBottom = mod.exports;
    }
})(this, function (_knockout, _jquery) {
    'use strict';

    var _knockout2 = _interopRequireDefault(_knockout);

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // Copyright (c) CBC/Radio-Canada. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.

    var handlerId = 0;

    //TODO: http://stackoverflow.com/questions/10324240/knockout-binding-handler-teardown-function (voir 2ieme réponse..?) (sur tous les bindings)
    _knockout2.default.bindingHandlers.triggerWhenScrolledToBottom = {

        //ko.utils.domData.get(element, key)
        //ko.utils.domData.set(element, key, value)
        //ko.utils.domData.clear(element)
        init: function init(element, valueAccessor, allBindingsAccessor, viewModel) {
            var action = _knockout2.default.utils.unwrapObservable(valueAccessor());
            var options = getOptions(allBindingsAccessor);
            setScrollHandlerIdFromElement(element);

            _knockout2.default.utils.domNodeDisposal.addDisposeCallback(element, function () {
                unregisterScrollEventIfRegistered(element, options);
            });

            if (!_knockout2.default.utils.unwrapObservable(options.disabled) && isScrolledIntoView(element, options)) {
                executeAction(element, viewModel, action);
            }
        },

        update: function update(element, valueAccessor, allBindingsAccessor, viewModel) {
            var action = _knockout2.default.utils.unwrapObservable(valueAccessor());
            var options = getOptions(allBindingsAccessor);

            if (_knockout2.default.utils.unwrapObservable(options.disabled)) {
                unregisterScrollEventIfRegistered(element, options);
            } else {
                registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel);
            }
        }
    };

    //TODO: debounce!!!
    function registerScrollEventIfNotAlreadyRegistered(element, action, options, viewModel) {
        var isScrollHandlerRegistered = _knockout2.default.utils.domData.get(element, 'isScrollHandlerRegistered');

        if (!isScrollHandlerRegistered) {
            _knockout2.default.utils.domData.set(element, 'isScrollHandlerRegistered', true);

            (0, _jquery2.default)(options.useParent ? (0, _jquery2.default)(element).parent() : window).on(getScrollHandlerIdFromElement(element), function (data, event) {
                if (isScrolledIntoView(element, options)) {
                    executeAction(element, viewModel, action, data, event);
                }
            });
        }
    }

    function getScrollHandlerIdFromElement(element) {
        return 'scroll.ko.' + _knockout2.default.utils.domData.get(element, 'scrollHandlerId');
    }

    function setScrollHandlerIdFromElement(element) {
        _knockout2.default.utils.domData.set(element, 'scrollHandlerId', 'scrollHandler' + ++handlerId);
    }

    function getOptions(allBindingsAccessor) {
        //TODO: Attention, triggerWhenScrolledToBottomOptions pourrait contenir des observables

        return _jquery2.default.extend({
            disabled: false,
            useParent: false,
            offset: 0
        }, allBindingsAccessor().triggerWhenScrolledToBottomOptions);
    }

    function unregisterScrollEventIfRegistered(element, options) {
        var isScrollHandlerRegistered = _knockout2.default.utils.domData.get(element, 'isScrollHandlerRegistered');

        if (isScrollHandlerRegistered) {
            _knockout2.default.utils.domData.set(element, 'isScrollHandlerRegistered', null);
            (0, _jquery2.default)(options.useParent ? (0, _jquery2.default)(element).parent() : window).off(getScrollHandlerIdFromElement(element));
        }
    }

    function executeAction(element, viewModel, action, data, event) {
        if (typeof action === 'string' || action instanceof String) {
            (0, _jquery2.default)(element).trigger(action);
        } else {
            action.call(viewModel, data, event);
        }
    }

    function isScrolledIntoView(element, options) {
        if (options.useParent) {
            var $parent = (0, _jquery2.default)(element).parent();

            return $parent.scrollTop() + $parent.innerHeight() >= $parent[0].scrollHeight;
        } else {
            var docViewTop = (0, _jquery2.default)(window).scrollTop();
            var docViewBottom = docViewTop + (0, _jquery2.default)(window).height() + options.offset;
            var elemTop = (0, _jquery2.default)(element).offset().top;
            var elemBottom = elemTop + (0, _jquery2.default)(element).height();

            return elemBottom <= docViewBottom && elemTop >= docViewTop;
        }
    }
});