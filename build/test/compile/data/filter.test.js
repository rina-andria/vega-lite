"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var formatparse_1 = require("../../../src/compile/data/formatparse");
var parse_1 = require("../../../src/compile/data/parse");
var util_1 = require("../../util");
describe('compile/data/filter', function () {
    it('should create parse for filtered fields', function () {
        var model = util_1.parseUnitModel({
            'data': { 'url': 'a.json' },
            'transform': [
                { 'filter': { 'field': 'a', 'equal': { year: 2000 } } },
                { 'filter': { 'field': 'b', 'oneOf': ['a', 'b'] } },
                { 'filter': { 'field': 'c', 'range': [{ year: 2000 }, { year: 2001 }] } },
                { 'filter': { 'field': 'd', 'range': [1, 2] } }
            ],
            'mark': 'point',
            encoding: {}
        });
        var parse = {};
        // extract the parse from the parse nodes that were generated along with the filter nodes
        var node = parse_1.parseTransformArray(model).first;
        while (node.numChildren() > 0) {
            if (node instanceof formatparse_1.ParseNode) {
                parse = __assign({}, parse, node.parse);
            }
            chai_1.assert.equal(node.numChildren(), 1);
            node = node.children[0];
        }
        chai_1.assert.deepEqual(parse, {
            a: 'date',
            b: 'string',
            c: 'date',
            d: 'number'
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L2NvbXBpbGUvZGF0YS9maWx0ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsNkJBQTRCO0FBQzVCLHFFQUFnRTtBQUVoRSx5REFBb0U7QUFJcEUsbUNBQTBDO0FBRTFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtJQUM5QixFQUFFLENBQUMseUNBQXlDLEVBQUU7UUFDNUMsSUFBTSxLQUFLLEdBQUcscUJBQWMsQ0FBQztZQUMzQixNQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDO1lBQ3pCLFdBQVcsRUFBRTtnQkFDWCxFQUFDLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFDLEVBQUM7Z0JBQ2pELEVBQUMsUUFBUSxFQUFFLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUMsRUFBQztnQkFDL0MsRUFBQyxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUMsRUFBQztnQkFDakUsRUFBQyxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxFQUFDO2FBQzVDO1lBQ0QsTUFBTSxFQUFFLE9BQU87WUFDZixRQUFRLEVBQUUsRUFBRTtTQUNiLENBQUMsQ0FBQztRQUVILElBQUksS0FBSyxHQUFpQixFQUFFLENBQUM7UUFFN0IseUZBQXlGO1FBQ3BGLElBQUEsK0NBQVcsQ0FBK0I7UUFDL0MsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLHVCQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixLQUFLLGdCQUFPLEtBQUssRUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUNELGFBQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFRCxhQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRTtZQUN0QixDQUFDLEVBQUUsTUFBTTtZQUNULENBQUMsRUFBRSxRQUFRO1lBQ1gsQ0FBQyxFQUFFLE1BQU07WUFDVCxDQUFDLEVBQUUsUUFBUTtTQUNaLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2Fzc2VydH0gZnJvbSAnY2hhaSc7XG5pbXBvcnQge1BhcnNlTm9kZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbXBpbGUvZGF0YS9mb3JtYXRwYXJzZSc7XG5pbXBvcnQge0xvb2t1cE5vZGV9IGZyb20gJy4uLy4uLy4uL3NyYy9jb21waWxlL2RhdGEvbG9va3VwJztcbmltcG9ydCB7cGFyc2VUcmFuc2Zvcm1BcnJheX0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbXBpbGUvZGF0YS9wYXJzZSc7XG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnLi4vLi4vLi4vc3JjL2xvZyc7XG5pbXBvcnQge0RpY3R9IGZyb20gJy4uLy4uLy4uL3NyYy91dGlsJztcbmltcG9ydCB7VmdMb29rdXBUcmFuc2Zvcm19IGZyb20gJy4uLy4uLy4uL3NyYy92ZWdhLnNjaGVtYSc7XG5pbXBvcnQge3BhcnNlVW5pdE1vZGVsfSBmcm9tICcuLi8uLi91dGlsJztcblxuZGVzY3JpYmUoJ2NvbXBpbGUvZGF0YS9maWx0ZXInLCAoKSA9PiB7XG4gIGl0KCdzaG91bGQgY3JlYXRlIHBhcnNlIGZvciBmaWx0ZXJlZCBmaWVsZHMnLCAoKSA9PiB7XG4gICAgY29uc3QgbW9kZWwgPSBwYXJzZVVuaXRNb2RlbCh7XG4gICAgICAnZGF0YSc6IHsndXJsJzogJ2EuanNvbid9LFxuICAgICAgJ3RyYW5zZm9ybSc6IFtcbiAgICAgICAgeydmaWx0ZXInOiB7J2ZpZWxkJzogJ2EnLCAnZXF1YWwnOiB7eWVhcjogMjAwMH19fSxcbiAgICAgICAgeydmaWx0ZXInOiB7J2ZpZWxkJzogJ2InLCAnb25lT2YnOiBbJ2EnLCAnYiddfX0sXG4gICAgICAgIHsnZmlsdGVyJzogeydmaWVsZCc6ICdjJywgJ3JhbmdlJzogW3t5ZWFyOiAyMDAwfSwge3llYXI6IDIwMDF9XX19LFxuICAgICAgICB7J2ZpbHRlcic6IHsnZmllbGQnOiAnZCcsICdyYW5nZSc6IFsxLCAyXX19XG4gICAgICBdLFxuICAgICAgJ21hcmsnOiAncG9pbnQnLFxuICAgICAgZW5jb2Rpbmc6IHt9XG4gICAgfSk7XG5cbiAgICBsZXQgcGFyc2U6IERpY3Q8c3RyaW5nPiA9IHt9O1xuXG4gICAgLy8gZXh0cmFjdCB0aGUgcGFyc2UgZnJvbSB0aGUgcGFyc2Ugbm9kZXMgdGhhdCB3ZXJlIGdlbmVyYXRlZCBhbG9uZyB3aXRoIHRoZSBmaWx0ZXIgbm9kZXNcbiAgICBsZXQge2ZpcnN0OiBub2RlfSA9IHBhcnNlVHJhbnNmb3JtQXJyYXkobW9kZWwpO1xuICAgIHdoaWxlIChub2RlLm51bUNoaWxkcmVuKCkgPiAwKSB7XG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFBhcnNlTm9kZSkge1xuICAgICAgICBwYXJzZSA9IHsuLi5wYXJzZSwgLi4ubm9kZS5wYXJzZX07XG4gICAgICB9XG4gICAgICBhc3NlcnQuZXF1YWwobm9kZS5udW1DaGlsZHJlbigpLCAxKTtcbiAgICAgIG5vZGUgPSBub2RlLmNoaWxkcmVuWzBdO1xuICAgIH1cblxuICAgIGFzc2VydC5kZWVwRXF1YWwocGFyc2UsIHtcbiAgICAgIGE6ICdkYXRlJyxcbiAgICAgIGI6ICdzdHJpbmcnLFxuICAgICAgYzogJ2RhdGUnLFxuICAgICAgZDogJ251bWJlcidcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==