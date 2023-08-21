import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { NeuralNetworkConstructorType } from './NeuralNetwork';
import { NN, NN_ExponentialWeights } from './NeuralNetwork';

type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

const neuralNetworks = { NN, NN_ExponentialWeights }

export const useML = (MLConfig: ConstructorParams<NeuralNetworkConstructorType>[0], data: { inputs: number[]; targets: number[] }[]) => {
    const intervalRef = useRef(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [neuralNetworkKey, setNeuralNetworkKey] = useState<'NN' | 'NN_ExponentialWeights'>('NN_ExponentialWeights')
    const [step, setStep] = useReducer((step: number, payload: { type: 'inc' | 'set', step?: number }) => payload.step ?? (step + 1), 0)
    const neuralNetwork = useMemo(() => new neuralNetworks[neuralNetworkKey](MLConfig), [neuralNetworkKey])
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => setStep({ type: 'inc' }), 100)
        }
        else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [isPlaying])

    const train = (epochs: number) => {
        for (let i = 0; i < epochs; i++) {
            neuralNetwork.train(data)
        }
        setStep({ type: 'set', step: step + epochs })
    }

    const output = useMemo(() => {
        neuralNetwork.train(data)
        return neuralNetwork.assess(data)
    }, [step])

    const canvas = useMemo(() => output.map(assessment => neuralNetwork.getCanvas(assessment)), [output])

    return {
        play: () => setIsPlaying(true),
        stop: () => setIsPlaying(false),
        incrementStep: () => setStep({ type: 'inc' }),
        reset: () => { neuralNetwork.reset(); setStep({ type: 'set', step: 0 }) },
        initialize: () => { neuralNetwork.initialize(); setStep({ type: 'set', step: 0 }) },
        isPlaying,
        step,
        output,
        canvas,
        train,
        setNeuralNetworkKey: (nuralNetworkKey: keyof typeof neuralNetworks) => { setNeuralNetworkKey(nuralNetworkKey); setStep({ type: 'set', step: 0 }) },
    }
}