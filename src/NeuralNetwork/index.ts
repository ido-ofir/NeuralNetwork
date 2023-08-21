import type { Matrix } from "../Matrix";
export { NN } from "./NN";
export { NN_ExponentialWeights } from "./NN_ExponentialWeights";

export interface AssessmentType {
    input: Matrix;
    output: Matrix;
    inputs: number[];
    targets: number[];
    outputs: Matrix[];
    weightsOutputs?: Matrix[][];
    accuracy: number;
}

export interface CanvasType {
    bias: number;
    output: number;
    weights: number[];
}

export interface NeuralNetworkType {
    train: (epochs: { inputs: number[]; targets: number[] }[]) => void
    assess: (data: { inputs: number[]; targets: number[] }[]) => AssessmentType[]
    getCanvas: (assessment: AssessmentType) => CanvasType[][][]
    initialize: () => void
    reset: () => void
}

export interface NeuralNetworkConstructorType {
    new(a: { inputs: number, layers: number[], outputs: number, learningRate: number }): NeuralNetworkType
}

