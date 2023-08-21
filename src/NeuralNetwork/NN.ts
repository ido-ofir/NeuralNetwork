import { NeuralNetworkType } from '.';
import { Matrix } from '../Matrix';

export class NN implements NeuralNetworkType {
    learningRate: number
    config: { inputs: number, layers: number[], outputs: number }
    outputErrors: Matrix[]
    initialLayers: { size: number, weights: Matrix, bias: Matrix }[]
    layers: { size: number, weights: Matrix, bias: Matrix }[]
    constructor({ inputs, layers, outputs, learningRate = 0.2 }: { inputs: number, layers: number[], outputs: number, learningRate: number }) {
        this.learningRate = learningRate;
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
            return {
                size: layer,
                weights: new Matrix([layer, prevLayers[index]]),
                bias: new Matrix([layer]),
            }
        })
        this.reset()
    }

    reset = () => {
        this.layers = this.initialLayers.map((layer, index) => {
            return {
                size: layer.size,
                weights: Matrix.copy(layer.weights),
                bias: Matrix.copy(layer.bias),
            }
        })
    }

    removeNode = (layer: number, index: number) => {
        if (layer === this.layers.length - 1) throw `Node at layer ${layer} cannot be removed`

        this.layers[layer].weights.remove(0, index)
        this.layers[layer].bias.remove(0, index)
        this.layers[layer + 1].weights.remove(1, index)
    }

    addNode = (layer: number) => {
        if (layer >= this.layers.length - 1) throw `Node at layer ${layer} cannot be added`

        this.layers[layer].weights.insert(0)
        this.layers[layer].bias.insert(0)
        this.layers[layer + 1].weights.insert(1)
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

        const outputs = [input]

        this.layers.forEach(({ weights, bias }) => {
            const output = Matrix.crossMultiply(weights, outputs[outputs.length - 1]);
            output.add(bias);
            output.map(this.sigmoid);
            outputs.push(output)
        })

        return {
            input,
            outputs: outputs.slice(1),
            output: outputs[outputs.length - 1],
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
                accuracy: 1 - targets.reduce((total, target, index) => total + Math.abs(target - output.getValue([index])), 0) / targets.length
            }
        })
    }

    train = (data: { inputs: number[]; targets: number[] }[]) => {
        const outputErrors = []
        data.forEach(({ inputs, targets }) => {
            // Feed forward
            const [{ outputs, input, accuracy }] = this.assess([{ inputs, targets }])

            const prevOutputs = [input, ...outputs.slice(0, -1)]

            this.outputErrors = [new Matrix([targets.length], targets).subtract(outputs[outputs.length - 1])]

            for (let i = outputs.length - 1; i >= 0; i--) {

                // Calculate gradient
                const output_sensitivity = Matrix.copy(outputs[i]).map(this.dsigmoid)
                const output_deltas = Matrix.copy(this.outputErrors[0]).multiply(output_sensitivity).multiply(this.learningRate / accuracy);

                // Prepare next outputErrors
                this.outputErrors.unshift(Matrix.crossMultiply(this.layers[i].weights, Matrix.copy(this.outputErrors[0]).subtract(output_deltas), [[0, 0]]))

                // Calculate deltas
                const weights_deltas = Matrix.crossMultiply(output_deltas, prevOutputs[i], []);

                // Adjust the weights by deltas
                this.layers[i].weights.add(weights_deltas)
                // Adjust the bias by its deltas
                this.layers[i].bias.add(output_deltas)
            }

            outputErrors.push(this.outputErrors)
        })
        // this.adjustLayers(data)
    }

    adjustLayers = (data: { inputs: number[]; targets: number[] }[]) => {
        const assessment = this.assess(data)

        let layersToAddNodesTo: number[] = []
        const layersStatistics: { sensitivity: number, errorRate: number, accuracy: number }[][] = []

        assessment.forEach(({ inputs, targets, outputs, accuracy }, i) => {
            const outputErrors = [new Matrix([targets.length], targets).subtract(outputs[outputs.length - 1])]
            for (let h = outputs.length - 1; h >= 0; h--) {
                outputErrors.unshift(Matrix.crossMultiply(this.layers[h].weights, Matrix.copy(outputErrors[0]).subtract(Matrix.copy(outputErrors[0]).multiply(Matrix.copy(outputs[h]).map(this.dsigmoid)).multiply(this.learningRate / accuracy)), [[0, 0]]))
            }
            outputs.forEach((output, j) => {
                if (!layersStatistics[j]) layersStatistics.push([])
                for (let j = 0; j < output.dimentions[0]; j++) {
                    const sensitivity = this.dsigmoid(output.getValue([j]))
                    const errorRate = this.xsigmoid(outputErrors[j + 1].getValue([j, 0]))

                    layersStatistics[j].push({
                        sensitivity,
                        errorRate,
                        accuracy
                    })
                }
            })
        })

        const estimatedAvgSensitivityPerLayer = layersStatistics.map((b) => b.reduce((c, d) => c + d['sensitivity'], 0) / b.length)

        const estimatedAccuracyPerLayer = layersStatistics.map((b) => 1 - b.reduce((c, d) => c + d['errorRate'], 0) / b.length)
        const estimatedMaxSensitivityPerLayer = layersStatistics.map((b) => Math.max(...b.map((d) => d['sensitivity'])))
        const estimatedMaxSensitivity = Math.max(...estimatedMaxSensitivityPerLayer.slice(0, -1))

        const accuracy = assessment.reduce((a, b) => a + b.accuracy, 0) / assessment.length

        if (this.unsigmoid(estimatedMaxSensitivity) > 1) {
            estimatedMaxSensitivityPerLayer.forEach((estimatedMaxSensitivity, layer) => {
                if (this.unsigmoid(1 - estimatedMaxSensitivity) <= 1) return
                if (this.unsigmoid(estimatedAccuracyPerLayer[layer]) > accuracy) return

                // layersToAddNodesTo.push(layer)
                if (layer < estimatedMaxSensitivityPerLayer.length - 1) {
                    layersToAddNodesTo.push(layer)
                }
                else if (estimatedMaxSensitivityPerLayer.length > 1) {
                    layersToAddNodesTo.push(layer - 1)
                }
            })

        }

        layersToAddNodesTo.forEach(layer => this.addNode(layer))
    }

    getCanvas = (assessment: ReturnType<NN['assess']>[number]) => {
        const inputs: { bias: number, output: number, weights: number[] }[] = assessment.inputs.map(t => ({ bias: 0, output: t, weights: [] }))
        const layers = [inputs]

        this.layers.forEach((layer, j) => {
            layers.push([])
            for (let i = 0; i < layer.weights.dimentions[0]; i++) {
                layers[layers.length - 1].push({
                    weights: layer.weights.getDimention([0]) as number[],
                    bias: layer.bias.getValue([i]),
                    output: assessment.outputs[j].getValue([i]),
                })
            }
        })

        return [layers];
    }
}