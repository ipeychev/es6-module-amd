define(
    "test.js",
    ["files/module2.js", "https://code.jquery.com/jquery-2.1.3.min.js", "files/module3.js", "exports"],
    function(
        $files$module2$js$,
        $https$$$code$jquery$com$jquery$2$1$3$min$js$,
        $files$module3$js$,
        __exports__) {
        var foo3 = $files$module2$js$;
        var foo2 = $files$module3$js$["d"];
        var jquery = $https$$$code$jquery$com$jquery$2$1$3$min$js$["jquery"];
        var b = $files$module2$js$["b"];
        var a = $files$module2$js$["a"];

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