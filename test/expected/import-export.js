define(
    "import-export.js",
    ["sub1/sub1.js", "https://code.jquery.com/jquery-2.1.3.min.js", "module2.js", "exports"],
    function(
        $sub1$sub1$js$,
        $https$$$code$jquery$com$jquery$2$1$3$min$js$,
        $module2$js$,
        __exports__) {
        var a = $module2$js$["a"];
        var b = $module2$js$["b"];
        var jquery = $https$$$code$jquery$com$jquery$2$1$3$min$js$["jquery"];
        var foo2 = $sub1$sub1$js$["d"];

        var e = 10,
            f = 20;

        function c () {
            return 30;
        }

        __exports__["e"] = e;
        __exports__["z"] = f;
        __exports__["default"] = c;
    }
);