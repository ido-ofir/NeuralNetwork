
const initializeDimentions = (dimentions, getValue = v => v) => {
    if(dimentions.length === 0) {
        return getValue(0)
    }
    return new Array(dimentions[0]).fill(0).map(() => initializeDimentions(dimentions.slice(1)))
}

export class Matrix {
    constructor(dimentions) {
        this.dimentions = dimentions

        this.data = initializeDimentions(dimentions)
    }

    static crossMultiply(...matrixes) {
        // for (let i = 1; i < matrixes.length; i++) {
        //     matrixes[i].dimentions
        //     if (matrixes[i].dimentions.some((d, j) => {
        //         return d !== matrixes[i - 1].dimentions[j]
        //     }))
        //     for (let j = i; j >= 1; j--) {
        //         if(matrixes[j - 1].dimentions[i] !== matrixes[j].dimentions[i - 1]) {
        //             throw `dimentions[${i}] of matrix ${j - 1} must match dimentions[${i - 1}] of matrix ${j}`
        //         }
        //     }
        // }

        // const newDimentions = matrixes.map((m, i) => m.dimentions[i])
        // return new Matrix(newDimentions)
        //     .map((e, indexes) => {
        //         return matrixes.reduce((sum, m, i) => {
        //             return sum + m.data[indexes[i]][i]
        //         }, 0)
        //         let sum = 0;
        //         for (let k = 0; k < a.cols; k++) {
        //             sum += a.data[i][k] * b.data[k][j];
        //         }
        //         return sum;
        //     });

        if (matrixes[0].dimentions.length !== 2 || matrixes[1].dimentions.length !== 2) {
            throw 'multiplication is not supported for other than 2 dimensions.'
        }
        if (matrixes[0].dimentions[1] !== matrixes[1].dimentions[0]) {
            throw 'dimentions[1] of A must match dimentions[0] of B.'
        }

        // if (matrixes[1].dimentions.length === 1) {
        //     return new Matrix([matrixes[0].dimentions[0]])
        //         .map((e, i) => {
        //             let sum = 0;
        //             for (let k = 0; k < matrixes[0].dimentions[1]; k++) {
        //                 sum += matrixes[0].data[i][k] * matrixes[1].data[k];
        //             }
        //             return sum;
        //         })
        // }

        return new Matrix([matrixes[0].dimentions[0], matrixes[1].dimentions[1]])
            .map((e, i, j) => {
                let sum = 0;
                for (let k = 0; k < matrixes[0].dimentions[1]; k++) {
                    sum += matrixes[0].data[i][k] * matrixes[1].data[k][j];
                }
                return sum;
            });
    }

    // Transpose matrix
    static transpose(matrix) {
        if (matrix.dimentions.length !== 2) {
            throw 'transposition is not supported for more other 2 dimensions.'
        }
        return new Matrix(matrix.dimentions.slice().reverse()).map((_, i, j) => matrix.data[j][i]);
    }

    static getValue(data, indexes) {
        return indexes.reduce((d, v) => d[v], data)
    }

    static copy(matrix) {
        return new Matrix(matrix.dimentions).map((_, ...indexes) => Matrix.getValue(matrix.data, indexes));
    }

    remove(dimention, index) {
        if (dimention > this.dimentions.length - 1) {
            throw 'dimention out of bounds'
        }
        if (index > this.dimentions[dimention] - 1) {
            throw 'index out of bounds'
        }

        const spliceDimention = (d, data) => {
            if(d === 0) {
                data.splice(index, 1);
                return
            }
            data.forEach(x => spliceDimention(d - 1, x))
        }
        spliceDimention(dimention, this.data)
        this.dimentions[dimention]--;
        
        return this;
    }

    insert(dimention) {
        if (dimention > this.dimentions.length - 1) {
            throw 'dimention out of bounds'
        }

        const pushToDimention = (d, data) => {
            if(d === dimention) {
                
                data.push(initializeDimentions(this.dimentions.slice(d + 1), () => Math.random() * 2 - 1));
                return
            }
            data.forEach(x => pushToDimention(d + 1, x))
        }
        pushToDimention(0, this.data)
        this.dimentions[dimention]++;
        
        return this;
    }

    // Fill the matrix with random numbers
    randomize() {
        return this.map(() => Math.random() * 2 - 1);
    }

    // Apply a function to every element of the matrix
    map(func) {
        const indexes = new Array(this.dimentions.length).fill(0)
        const targetIndexes = JSON.stringify(this.dimentions.map((d, i) => i !== this.dimentions.length - 1 ? d - 1 : d))
        while (JSON.stringify(indexes) !== targetIndexes) {
            const target = Matrix.getValue(this.data, indexes.slice(0, indexes.length - 1))
            target[indexes[indexes.length - 1]] = func(target[indexes[indexes.length - 1]], ...indexes)

            indexes[indexes.length - 1]++
            if(indexes[indexes.length - 1] >= this.dimentions[indexes.length - 1]) {
                if(this.dimentions.length === 1) {
                    break
                }
                let i = indexes.length - 1
                for (i; i >=0; i--) {
                    if(indexes[i] >= this.dimentions[i]) {
                        indexes[i] = 0
                    }
                    else {
                        indexes[i]++
                        break
                    }
                }
                if (indexes[0] === this.dimentions[0]) {
                    break
                }
            }
        }
        return this;
    }

    add(n) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e + Matrix.getValue(n.data, indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e + n);
        }
    }

    subtract(n) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e - Matrix.getValue(n.data, indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e - n);
        }
    }

    multiply(n) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e * Matrix.getValue(n.data, indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e * n);
        }
    }

    divide(n) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e / Matrix.getValue(n.data, indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e / n);
        }
    }
}
