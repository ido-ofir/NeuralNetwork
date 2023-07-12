
const initializeDimentions = (dimentions, getValue = v => v) => {
    if(dimentions.length === 0) {
        return getValue(0)
    }
    return new Array(dimentions[0]).fill(0).map(() => initializeDimentions(dimentions.slice(1)))
}

export class Matrix {
    constructor(dimentions, arr) {
        this.dimentions = dimentions

        this.data = initializeDimentions(dimentions)

        if (arr) {
            this.map((_, ...indexes) => arr[indexes.reduce((a, b, i) => a + [b, ...dimentions.filter((_, j) => j > i)].reduce((x, z) => x * z, 1), 1) - 1])
        }
    }

    static crossMultiply(a, b, dimentionsIntersections = [[1, 0]]) {
        const invalidDiIndex = dimentionsIntersections.findIndex(di => a.dimentions[di[0]] !== b.dimentions[[di[1]]])
        if (invalidDiIndex !== -1) {
            throw `dimention ${dimentionsIntersections[invalidDiIndex][0]} of matrix ${a} must match dimention ${dimentionsIntersections[invalidDiIndex][1]} of matrix ${b}`
        }

        const newDimentions = a.dimentions.filter((_, i) => !dimentionsIntersections.map(di => di[0]).includes(i)).concat(b.dimentions.filter((_, i) => !dimentionsIntersections.map(di => di[1]).includes(i)))
        return new Matrix(newDimentions)
            .map((e, ...indexes) => {
                let sum = 0;
                if (dimentionsIntersections.length) {
                    for (let m = 0; m < dimentionsIntersections.length; m++) {
                        for (let k = 0; k < a.dimentions[dimentionsIntersections[m][0]]; k++) {
                            const aIndexes = a.dimentions.map((d, i) => i === dimentionsIntersections[m][0] ? k : i > dimentionsIntersections[m][0] ? indexes[i - 1] : indexes[i])
                            const bIndexes = b.dimentions.map((d, i) => i === dimentionsIntersections[m][1] ? k : i > dimentionsIntersections[m][1] ? indexes[i - 1] : indexes[i])
                            sum += Matrix.getValue(a.data, aIndexes) * Matrix.getValue(b.data, bIndexes);
                        }
                    }
                }
                else {
                    const aIndexes = indexes.slice(0, a.dimentions.length)
                    const bIndexes = indexes.slice(a.dimentions.length)
                    sum += Matrix.getValue(a.data, aIndexes) * Matrix.getValue(b.data, bIndexes);
                }
                return sum;
            });
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
        if (!Array.isArray(this.data)) {
            this.data = func(this.data)
        }
        else {
            const indexes = new Array(this.dimentions.length).fill(0)
            while (true) {
                const target = Matrix.getValue(this.data, indexes.slice(0, indexes.length - 1))
                target[indexes[indexes.length - 1]] = func(target[indexes[indexes.length - 1]], ...indexes)

                let i = indexes.length - 1
                let done = false
                if(indexes[i] === this.dimentions[i] - 1) {
                    for (i; i >=0; i--) {
                        if(indexes[i] === this.dimentions[i] - 1) {
                            indexes[i] = 0
                            if (i === 0) {
                                done = true
                                break
                            }
                        }
                        else {
                            break
                        }
                    }
                }
                if (done) {
                    break
                }
                indexes[i]++
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

    toString() {
        return `[${this.dimentions.join(', ')}]`
    }
}
