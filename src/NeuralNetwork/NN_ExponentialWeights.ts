import { Matrix } from '../Matrix';
import { NeuralNetworkType } from './';

export class NN_ExponentialWeights implements NeuralNetworkType {
    learningRate: number
    config: { inputs: number, layers: number[], outputs: number }
    outputErrors: Matrix[][]
    initialLayers: { size: number, weights: Matrix[], bias: Matrix }[]
    layers: { size: number, weights: Matrix[], bias: Matrix }[]
    constructor({ inputs, layers, outputs, learningRate = 0.2 }: { inputs: number, layers: number[], outputs: number, learningRate: number }) {
        this.learningRate = learningRate
        this.config = { inputs, layers, outputs }
        this.outputErrors = []
        this.initialLayers = []
        this.layers = []

        this.initialize()
    }

    static Matrix = Matrix

    initialize = () => {
        const { inputs, layers, outputs } = this.config
        const prevLayers = [inputs, ...layers];
        this.initialLayers = [...layers, outputs].map((layer, index) => {
            const weights: Matrix[] = []
            for (let j = 0; j <= index; j++) {
                weights.push(new Matrix([layer, prevLayers[j]]))
            }
            return {
                size: layer,
                weights,
                bias: new Matrix([layer]),
            }
        })
        this.reset()
    }

    reset = () => {
        this.layers = this.initialLayers.map((layer, index) => {
            return {
                size: layer.size,
                weights: layer.weights.map(w => Matrix.copy(w)),
                bias: Matrix.copy(layer.bias),
            }
        })
    }

    removeNode = (layer: number, index: number) => {
        if (layer === this.layers.length - 1) throw `Node at layer ${layer} cannot be removed`

        this.layers[layer].weights[this.layers[layer].weights.length - 1].remove(0, index)
        this.layers[layer].bias.remove(0, index)
        for (let j = layer + 1; j < this.layers.length; j++) {
            this.layers[j].weights[layer].remove(1, index)
        }
    }

    addNode = (layer: number) => {
        if (layer >= this.layers.length - 1) throw `Node at layer ${layer} cannot be added`

        this.layers[layer].weights[this.layers[layer].weights.length - 1].insert(0)
        this.layers[layer].bias.insert(0)
        for (let j = layer + 1; j < this.layers.length; j++) {
            this.layers[j].weights[layer].insert(1)
        }
    }

    // Define the activation function and its derivative
    sigmoid = (x: number) => {
        return 1 / (1 + Math.exp(-x));
    }

    dsigmoid = (y: number) => {
        // y is already sigmoided
        return y * (1 - y) * 4;
    }

    unsigmoid = (y: number) => {
        return Math.log(y / (1 - y))
    }

    xsigmoid = (x: number) => {
        return 1 - 2 / (Math.exp(x) + Math.exp(-x));
    }

    predict = (inputArray: number[]) => {
        const input = new Matrix([inputArray.length], inputArray)

        const outputs: Matrix[] & { 0: Matrix } = [input]
        const weightsOutputs: Matrix[][] = []

        this.layers.forEach(({ size, weights, bias }, index) => {
            const output = new Matrix([size])
            weightsOutputs.push([])
            for (let j = 0; j <= index; j++) {
                const weightsOutput = Matrix.crossMultiply(weights[j], outputs[j])
                weightsOutputs[weightsOutputs.length - 1].push(weightsOutput)
                output.add(weightsOutput)
            }
            output.add(bias);
            output.map(this.sigmoid);
            outputs.push(output)
        })

        return {
            input,
            outputs: outputs.slice(1),
            output: outputs[outputs.length - 1],
            weightsOutputs,
        }
    }

    assess = (data: { inputs: number[]; targets: number[] }[]) => {
        return data.map(({ inputs, targets }) => {
            const { outputs, input, output } = this.predict(inputs)
            return {
                input,
                output,
                inputs,
                targets,
                outputs,
                // weightsOutputs,
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - output.getValue([index])), 0) / targets.length
            }
        })
    }

    train = (data: { inputs: number[]; targets: number[] }[]) => {
        const outputErrors: Matrix[][][] = []
        data.forEach(({ inputs, targets }) => {
            const [{ outputs, input, accuracy }] = this.assess([{ inputs, targets }])

            const prevOutputs = [input, ...outputs.slice(0, -1)]

            this.outputErrors = [[new Matrix([targets.length], targets).subtract(outputs[outputs.length - 1])]]

            for (let i = this.layers.length - 1; i >= 0; i--) {
                this.outputErrors.unshift([])

                const output_sensitivity = Matrix.copy(outputs[i]).map(this.dsigmoid)

                const output_deltas = Matrix.copy(this.outputErrors[1][0]).multiply(output_sensitivity).multiply(this.learningRate / accuracy);

                for (let k = this.layers[i].weights.length - 1; k >= 0; k--) {
                    this.outputErrors[0].unshift(Matrix.crossMultiply(this.layers[i].weights[k], Matrix.copy(this.outputErrors[1][0]).subtract(output_deltas), [[0, 0]]))

                    const weights_deltas = Matrix.crossMultiply(output_deltas, prevOutputs[k], []).divide(this.layers.length - i);

                    // Adjust the weights by deltas
                    this.layers[i].weights[k].add(weights_deltas)
                }
                // Adjust the bias by its deltas
                this.layers[i].bias.add(output_deltas)
            }

            outputErrors.push(this.outputErrors)
        })
        // neuralNetwork.adjustLayers(data)
    }

    // adjustLayers = (data) => {
    //     const assessment = this.assess(data)

    //     let layersToAddNodesTo = []
    //     const layersStatistics = []

    //     assessment.forEach(({ inputs, targets, outputs, accuracy }, i) => {
    //         const outputErrors = [new Matrix([targets.length], targets).subtract(outputs.at(-1))]
    //         for (let h = outputs.length - 1; h >= 0; h--) {
    //             outputErrors.unshift(Matrix.crossMultiply(this.layers[h].weights, Matrix.copy(outputErrors[0]).subtract(Matrix.copy(outputErrors[0]).multiply(Matrix.copy(outputs[h]).map(this.dsigmoid)).multiply(this.learningRate / accuracy)), [[0, 0]]))
    //         }
    //         outputs.forEach((output, j) => {
    //             if(!layersStatistics[j]) layersStatistics.push([])
    //             output.data.forEach((outputValue, k) => {
    //                 const sensitivity = this.dsigmoid(outputValue)
    //                 const errorRate = neuralNetwork.xsigmoid(outputErrors[j + 1].data[k][0])

    //                 layersStatistics[j].push({
    //                     sensitivity,
    //                     errorRate,
    //                     accuracy
    //                 })
    //             })
    //         })
    //     })

    //     const estimatedAvgSensitivityPerLayer = layersStatistics.map((b) => b.reduce((c, d) => c + d['sensitivity'], 0) / b.length)

    //     const estimatedAccuracyPerLayer = layersStatistics.map((b) => 1 - b.reduce((c, d) => c + d['errorRate'], 0) / b.length)
    //     const estimatedMaxSensitivityPerLayer = layersStatistics.map((b) => Math.max(...b.map((d) => d['sensitivity'])))
    //     const estimatedMaxSensitivity = Math.max(...estimatedMaxSensitivityPerLayer.slice(0, -1))

    //     const accuracy = assessment.reduce((a, b) => a + b.accuracy, 0) / assessment.length

    //     if(neuralNetwork.unsigmoid(estimatedMaxSensitivity) > 1) {
    //         estimatedMaxSensitivityPerLayer.forEach((estimatedMaxSensitivity, layer) => {
    //             if(neuralNetwork.unsigmoid(1 - estimatedMaxSensitivity) <= 1) return
    //             if(neuralNetwork.unsigmoid(estimatedAccuracyPerLayer[layer]) > accuracy) return

    //             // layersToAddNodesTo.push(layer)
    //             if(layer < estimatedMaxSensitivityPerLayer.length - 1){
    //                 layersToAddNodesTo.push(layer)
    //             }
    //             else if (estimatedMaxSensitivityPerLayer.length > 1){
    //                 layersToAddNodesTo.push(layer - 1)
    //             }
    //         })

    //     }

    //     layersToAddNodesTo.forEach(layer => this.addNode(layer))
    // }

    getCanvas = (assessment: ReturnType<NN_ExponentialWeights['assess']>[number]) => {
        const inputs: { bias: number, output: number, weights: number[] }[] = assessment.inputs.map(t => ({ bias: 0, output: t, weights: [] }))
        const layers: { bias: number, output: number, weights: number[] }[][][] = []

        this.layers.forEach((layer, j) => {
            let layerInputs = inputs
            if (j > 0) {
                const a = assessment.outputs[j - 1].getDimention([]) as number[]
                layerInputs = a.map(t => ({ bias: 0, output: t, weights: [] }))
            }
            layers.push([layerInputs])
            for (let k = j; k < this.layers.length; k++) {
                layers[layers.length - 1].push([])
                for (let i = 0; i < this.layers[k].weights[j].dimentions[0]; i++) {
                    layers[layers.length - 1][layers[layers.length - 1].length - 1].push({
                        weights: this.layers[k].weights[j].getDimention([i]) as number[],
                        bias: this.layers[k].bias.getValue([i]),
                        output: assessment.outputs[j].getValue([i]),
                    })
                }
            }
        })

        // const layers = [inputs]
        // this.layers.forEach((layer, j) => {
        //     layers.push([])
        //     const lastWeight = layer.weights[layer.weights.length - 1]
        //     for (let i = 0; i < lastWeight.dimentions[0]; i++) {
        //         layers[layers.length - 1].push({
        //             weights: lastWeight.getDimention([0]) as number[],
        //             bias: layer.bias.getValue([i]),
        //             output: assessment.outputs[j].getValue([i]),
        //         })
        //     }
        // })

        return layers;
    }
}
