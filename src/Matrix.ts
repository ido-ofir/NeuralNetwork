type Data = Data[] | number

const randomize = () => Math.random() * 2 - 1

const initializeDimentions = (dimentions: number[], getValue: (v: number) => number = v => v): Data => {
    if (dimentions.length === 0) {
        return getValue(0)
    }
    return new Array(dimentions[0]).fill(0).map(() => initializeDimentions(dimentions.slice(1)))
}

export class Matrix {
    dimentions: number[]
    data: Data
    constructor(dimentions: number[], arr?: number[]) {
        this.dimentions = dimentions

        this.data = initializeDimentions(dimentions)

        if (arr) {
            // i.e. [1,2,3,4] => [[1,2],[3,4]]
            this.map((_, ...indexes) => arr[indexes.reduce((a, b, i) => a + [b, ...dimentions.filter((_, j) => j > i)].reduce((x, z) => x * z, 1), 1) - 1])
        }
        else {
            this.map(randomize)
        }
    }

    static copy(matrix: Matrix) {
        return new Matrix(matrix.dimentions).map((_, ...indexes) => matrix.getValue(indexes));
    }

    static crossMultiply(a: Matrix, b: Matrix, dimentionsIntersections = [[1, 0]]) {
        const dis = dimentionsIntersections
        const invalidDi = dis.find(di => a.dimentions[di[0]] !== b.dimentions[di[1]])
        if (invalidDi) {
            throw `dimention ${invalidDi[0]} of matrix ${a} must match dimention ${invalidDi[1]} of matrix ${b}`
        }

        const aFilteredDimentions = a.dimentions.filter((_, i) => !dis.map(di => di[0]).includes(i))
        const bFilteredDimentions = b.dimentions.filter((_, i) => !dis.map(di => di[1]).includes(i))
        const newDimentions = [...aFilteredDimentions, ...bFilteredDimentions]
        return new Matrix(newDimentions)
            .map((e, ...indexes) => {
                let sum = 0;
                const indexesArr = [{
                    a: indexes.slice(0, aFilteredDimentions.length),
                    b: indexes.slice(aFilteredDimentions.length)
                }]
                for (let m = 0; m < dis.length; m++) {
                    for (let j = indexesArr.length - 1; j >= 0; j--) {
                        const newIndexes = []
                        for (let k = 0; k < a.dimentions[dis[m][0]]; k++) {
                            newIndexes.push({
                                a: [...indexesArr[j].a.slice(0, dis[m][0]), k, ...indexesArr[j].a.slice(dis[m][0])],
                                b: [...indexesArr[j].b.slice(0, dis[m][1]), k, ...indexesArr[j].b.slice(dis[m][1])]
                            })
                        }
                        indexesArr.splice(j, 1, ...newIndexes)
                    }
                }
                for (let i = 0; i < indexesArr.length; i++) {
                    sum += a.getValue(indexesArr[i].a) * b.getValue(indexesArr[i].b);
                }
                return sum;
            });
    }

    getValue(indexes: number[]): number {
        const value = indexes.reduce((d, v) => {
            if (!Array.isArray(d)) {
                throw `dimention ${v} of matrix ${this} must be an array`
            }
            return d[v]
        }, this.data)

        if (Array.isArray(value)) {
            throw `dimention ${indexes.length} of matrix ${this} must be a number`
        }

        return value
    }

    getDimention(indexes: number[]): Data[] {
        const value = indexes.reduce((d, v) => {
            if (!Array.isArray(d)) {
                throw `dimention ${v} of matrix ${this} must be an array`
            }

            return d[v]
        }, this.data)

        if (!Array.isArray(value)) {
            throw `dimention ${indexes.length} of matrix ${this} must be an array`
        }

        return value
    }

    remove(dimention: number, index: number) {
        if (dimention < 0 || dimention > this.dimentions.length - 1) {
            throw 'dimention out of bounds'
        }
        if (index > this.dimentions[dimention] - 1) {
            throw 'index out of bounds'
        }

        const spliceDimention = (d: number, data: Data) => {
            if (!Array.isArray(data)) {
                throw `dimention ${d} of matrix ${data} must be an array`
            }
            if (d === 0) {
                data.splice(index, 1);
                return
            }
            data.forEach(x => spliceDimention(d - 1, x))
        }
        spliceDimention(dimention, this.data)
        this.dimentions[dimention]--;

        return this;
    }

    insert(dimention: number) {
        if (dimention < 0 || dimention > this.dimentions.length - 1) {
            throw 'dimention out of bounds'
        }

        const pushToDimention = (d: number, data: Data) => {
            if (!Array.isArray(data)) {
                throw `dimention ${d} of matrix ${data} must be an array`
            }
            if (d === dimention) {
                data.push(initializeDimentions(this.dimentions.slice(d + 1), randomize));
                return
            }
            data.forEach(x => pushToDimention(d + 1, x))
        }
        pushToDimention(0, this.data)
        this.dimentions[dimention]++;

        return this;
    }

    // Apply a function to every element of the matrix
    map(func: (...indexes: number[]) => number) {
        const indexes: number[] = new Array(this.dimentions.length).fill(0)
        while (true) {
            if (typeof this.data === 'number') {
                this.data = func(this.data, ...indexes)
            }
            else {
                const lastIndex = indexes.at(-1)
                if (typeof lastIndex !== 'undefined') {
                    const parentOfTarget = indexes.slice(0, -1).reduce((d, v) => {
                        const value = d[v]

                        if (typeof value === 'number') {
                            throw `dimention ${v} of matrix ${d} must be an array`
                        }

                        return value
                    }, this.data)

                    const value = parentOfTarget[lastIndex]
                    if (typeof value !== 'number') {
                        throw `indexes ${indexes} do not match the data of matrix ${this}`
                    }

                    parentOfTarget[lastIndex] = func(value, ...indexes)
                }
            }

            if (!indexes.length) {
                break
            }

            let i = indexes.length - 1
            let done = false
            if (indexes[i] === this.dimentions[i] - 1) {
                for (i; i >= 0; i--) {
                    if (indexes[i] === this.dimentions[i] - 1) {
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
        return this;
    }

    add(n: Matrix | number) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e + n.getValue(indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e + n);
        }
    }

    subtract(n: Matrix | number) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e - n.getValue(indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e - n);
        }
    }

    multiply(n: Matrix | number) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e * n.getValue(indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e * n);
        }
    }

    divide(n: Matrix | number) {
        if (n instanceof Matrix) {
            if (n.dimentions.some((d, i) => d !== this.dimentions[i])) {
                throw 'dimentions of the supplied matrix must be contained within the dimentions of this matrix'
            }
            return this.map((e, ...indexes) => e / n.getValue(indexes.slice(0, n.dimentions.length)));
        }
        else {
            return this.map(e => e / n);
        }
    }

    toString() {
        return `[${this.dimentions.join(', ')}]`
    }

    toArray() {
        const arr: number[] = []
        this.map((e) => arr.push(e))
        return arr
    }
}
