export class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));
    }

    // Fill the matrix with random numbers
    randomize() {
        return this.map(() => Math.random() * 2 - 1);
    }

    // Apply a function to every element of the matrix
    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let val = this.data[i][j];
                this.data[i][j] = func(val, i, j);
            }
        }
        return this;
    }

    // Create a new matrix from an array
    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((e, i) => arr[i]);
    }

    // Convert the matrix to an array
    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }

    // Subtract two matrices
    static subtract(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw 'Columns and Rows of A must match Columns and Rows of B.'
        }
        // Return a new Matrix a-b
        return new Matrix(a.rows, a.cols)
            .map((_, i, j) => a.data[i][j] - b.data[i][j]);
    }

    // Add two matrices
    add(n) {
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                throw 'Columns and Rows of A must match Columns and Rows of B.'
            }
            return this.map((e, i, j) => e + n.data[i][j]);
        } else {
            return this.map(e => e + n);
        }
    }

    // Multiply two matrices element wise
    multiply(n) {
        // Matrix product
        if (n instanceof Matrix) {
            if (this.rows !== n.rows || this.cols !== n.cols) {
                throw 'Columns and Rows of A must match Columns and Rows of B.'
            }
            return this.map((e, i, j) => e * n.data[i][j]);
        } else {
            // Scalar product
            return this.map(e => e * n);
        }
    }

    // Matrix multiplication
    static multiply(a, b) {
        // Matrix product
        if (a.cols !== b.rows) {
            throw 'Columns of A must match rows of B.'
        }

        return new Matrix(a.rows, b.cols)
            .map((e, i, j) => {
                // Dot product of values in col
                let sum = 0;
                for (let k = 0; k < a.cols; k++) {
                    sum += a.data[i][k] * b.data[k][j];
                }
                return sum;
            });
    }

    // Transpose matrix
    static transpose(matrix) {
        return new Matrix(matrix.cols, matrix.rows)
            .map((_, i, j) => matrix.data[j][i]);
    }
}
