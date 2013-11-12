(function(){

    function _rc() {
        return _.shuffle(['red', 'green', 'blue', 'cyan', 'magenta', 'orange'])[0];
    }

    var COS_30 = Math.cos(Math.PI / 6);
    var SIN_30 = Math.sin(Math.PI / 6);
    var COS_30_x_2 = COS_30 * 2;
    var COS_30_x_3 = COS_30 * 3;
    var COS_30_x_3_div_2 = COS_30 * 3 / 2;
    var COS_30_div_2 = COS_30 / 2;


    /**
     * Hex_Cell is a polygon circumscribed in a circle
     * defined by its center and hex_size radius.
     *
     * The center is computed by its position on a "jagged grid".
     * The hexagon's points are aligned so that they start at the left
     * and right corners (3 and 9 o'clock), so it's flat on the top and bottom.
     *
     * @param i - the index of the row(x) position
     * @param j - the index of the column (y) position
     * @param hex_size - the distance from the center to any point.
     * @constructor
     */

    EASEL_MAP.class.Hex_Cell = function (i, j, hex_size, points) {
        this.hex_size = hex_size;
        this.row = i;
        this.col = j;

        if (!points) {
            this.calc_points();
        } else {
            this.points = points;
        }
    };

    EASEL_MAP.class.Hex_Cell.prototype = {
        calc_points: function () {
            var xs = [
                -this.hex_size,
                -this.hex_size * SIN_30,
                this.hex_size * SIN_30,
                this.hex_size
            ];

            var ys = [
                -this.hex_size * COS_30,
                0,
                this.hex_size * COS_30];

            this.points = [
                {x: xs[0], y: ys[1]} ,
                {x: xs[1], y: ys[0]},
                {x: xs[2], y: ys[0]},
                {x: xs[3], y: ys[1]},
                {x: xs[2], y: ys[2]},
                {x: xs[1], y: ys[2]}
            ]
        },

        ij_index: function(){
          return Math.floor(this.row/10) + '_' + Math.floor(this.col/10);
        },

        center: function () {
            return {x: this.center_x(), y: this.center_y()};
        },

        clone: function () {
            return new EASEL_MAP.class.Hex_Cell(this.row, this.col, this.hex_size);
        },

        draw_circle: function (container) {
            var shape = new createjs.Shape();
            var text = new createjs.Text(this.row + ',' + this.col, this.hex_size + 'px Arial', 'black');
            text.x = shape.x = this.center_x();
            text.y = shape.y = this.center_y();
            text.textAlign = 'center';
            text.textBaseline = 'bottom';

            shape.graphics.s(_rc()).dc(0, 0, this.hex_size)
                .mt(0, -this.hex_size).lt(0, this.hex_size)
                .mt(-this.hex_size, 0).lt(this.hex_size, 0)
                .mt(-this.hex_size * COS_30 / 2, -this.hex_size * COS_30)
                .lt(this.hex_size * COS_30 / 2, this.hex_size * COS_30)
                .mt(this.hex_size * COS_30 / 2, -this.hex_size * COS_30)
                .lt(-this.hex_size * COS_30 / 2, this.hex_size * COS_30)
                .es();
            container.addChild(text);
            container.addChild(shape);
            return shape;
        },

        outline: function (container, color, width, scale) {
            var shape = new createjs.Shape();
            var text = new createjs.Text(this.row + ',' + this.col, (this.hex_size / 2) + 'px Arial', 'black');
            text.x = shape.x = this.center_x();
            text.y = shape.y = this.center_y();
            shape.graphics.ss(width).s(color);
            var points = this.points;

            shape.graphics.mt(_.last(points).x, _.last(points).y);
            _.each(points, function (point) {
                shape.graphics.lt(point.x, point.y);

            });
            shape.graphics.es();
            // container.addChild(text);
            container.addChild(shape);

            var rect = this.bound(shape);
            return shape;
        },

        fill: function (container, color, shape, scale) {
            var refresh = !!shape;
            if (!shape) shape = new createjs.Shape();
            shape.graphics.f(color);
            shape.x = this.center_x();
            shape.y = this.center_y();
            var points = this.points;

            shape.graphics.mt(_.last(points).x, _.last(points).y);
            _.each(points, function (point) {
                shape.graphics.lt(point.x, point.y);

            });
            shape.graphics.es();
            // container.addChild(text);
            container.addChild(shape);

            var extent = Math.ceil(this.hex_size) + 1;

            shape.cache(-extent, -extent, 2 * extent, 2 * extent, scale);
            return shape;
        },

        bound: function (shape) {
            shape.setBounds(Math.floor(this.center_x() - this.hex_size) - 1,
                Math.floor(this.center_y() - this.hex_size * COS_30) - 1,
                2 * Math.ceil(this.hex_size) + 2,
                2 * Math.ceil(COS_30 * this.hex_size) + 2
            )
            return shape.getBounds();
        },

        center_x: function () {
            return this.col * this.col_unit();
        },

        col_unit: function () {
            return this.hex_size * (1 + SIN_30);
        },

        row_unit: function () {
            return this.hex_size * (2 * COS_30);
        },

        center_y: function () {
            var k = this.row;
            if (this.col % 2) {
                k -= 0.5;
            }
            return k * this.row_unit();
        },

        global: function (container) {
            return container.localToGlobal(this.center_x(), this.center_y());
        },

        stroke_color: function (render_params) {
            if (render_params.stroke_color) {
                if (_.isFunction(render_params.stroke_color)) {
                    return render_paramms.stroke_color(this);
                } else {
                    return render_params.stroke_color;
                }
            } else {
                return 'black';
            }
        },

        fill_color: function (render_params) {
            if (render_params.fill_color) {
                if (_.isFunction(render_params.fill_color)) {
                    return render_params.fill_color(this);
                } else {
                    return render_params.fill_color;
                }
            } else {
                return 'grey';
            }
        },

        stroke_width: function (render_params) {
            var base = 1;
            if (render_params.stroke_width) {
                if (_.isFunction(render_params.stroke_width)) {
                    base = render_paramms.stroke_width(this);
                } else {
                    base = render_params.stroke_width;
                }
            }
            return base / render_params.scale;
        }

    };

})(window);