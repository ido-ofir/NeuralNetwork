
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
        const dis = dimentionsIntersections
        const invalidDi = dis.find(di => a.dimentions[di[0]] !== b.dimentions[di[1]])
        if (invalidDi) {
            throw `dimention ${invalidDi[0]} of matrix ${a} must match dimention ${invalidDi[1]} of matrix ${b}`
        }

        const aFilteredDimentions = a.dimentions.filter((_, i) => !dis.map(di => di[0]).includes(i))
        const bFilteredDimentions = b.dimentions.filter((_, i) => !dis.map(di => di[1]).includes(i))
        const newDimentions = [ ...aFilteredDimentions, ...bFilteredDimentions ]
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
                    sum += Matrix.getValue(a.data, indexesArr[i].a) * Matrix.getValue(b.data, indexesArr[i].b);
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
        if (dimention < 0 || dimention > this.dimentions.length - 1) {
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
        if (dimention < 0 || dimention > this.dimentions.length - 1) {
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
        while (true) {
            const pathToTarget= ['data', ...indexes]
            const parentOfTarget = Matrix.getValue(this, pathToTarget.slice(0, -1))
            parentOfTarget[pathToTarget.at(-1)] = func(parentOfTarget[pathToTarget.at(-1)], ...indexes)
            
            if (!indexes.length) {
                break
            }

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
