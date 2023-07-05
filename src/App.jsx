import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { NeuralNetwork } from './NeuralNetwork2'
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas'

const config = {
    inputs: 3,
    layers: [2],
    outputs: 2,
    learningRate: 0.2,
}

const data = [
    {
        inputs: [0, 1, 0],
        targets: [1, 1],
    },
    {
        inputs: [1, 0, 1],
        targets: [1, 0],
    },
    {
        inputs: [0, 0, 0],
        targets: [0, 1],
    },
    {
        inputs: [1, 1, 1],
        targets: [0, 0],
    }
]

const getCanvas = (neuralNetwork, assessment) => {
    const inputs = assessment.inputs.map(t => ({ bias: 0, output: t }))
    const layers = [inputs]

    neuralNetwork.layers.forEach((layer, j) => {
        layers.push([])
        layer.weights.data.map((weights, i) => {
            layers.at(-1).push({
                weights,
                bias: layer.bias.data[i][0],
                output: assessment.outputs[j].data[i][0],
            })
        })
    })

    return layers;
}


const useML = (MLConfig, data) => {
    const intervalRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [stepsCount, step] = useReducer((stepsCount, newStepsCount) => newStepsCount ?? (stepsCount + 1), 0)
    const [output, setOutput] = useState([])
    const [neuralNetwork] = useState(() => new NeuralNetwork(MLConfig))
    const [canvas, setCanvas] = useState([])
    window.neuralNetwork = neuralNetwork
    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => step(), 100)
        }
        else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [isPlaying])

    const train = (epochs) => {
        for (let i = 0; i < epochs; i++) {
            neuralNetwork.train(data)
        }
        step(stepsCount + epochs)
    }

    useMemo(() => {
        neuralNetwork.train(data)
        const assessments = neuralNetwork.assess(data)
        setOutput(assessments)
        setCanvas(assessments.map(assessment => getCanvas(neuralNetwork, assessment)))
    }, [stepsCount])

    return {
        play: () => setIsPlaying(true),
        stop: () => setIsPlaying(false),
        step: () => step(),
        reset: () => {neuralNetwork.reset(); step(0)},
        initialize: () => {neuralNetwork.initialize(); step(0)},
        isPlaying,
        stepsCount,
        output,
        canvas,
        train,
    }
}

const App = () => {
    const {
        play,
        stop,
        step,
        reset,
        initialize,
        isPlaying,
        stepsCount,
        output,
        train,
        canvas,
    } = useML(config, data)

    return (
        <div style={{ height: '100%', position: 'relative', fontSize: '20px', color: '#fff' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, flex: 1, position: 'relative' }}>
                <div style={{ display: 'flex', flex: 1 }}>
                    <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                        <NeuralNetworkCanvas network={canvas[0]} />
                        <NeuralNetworkCanvas network={canvas[1]} />
                        <NeuralNetworkCanvas network={canvas[2]} />
                        <NeuralNetworkCanvas network={canvas[3]} />
                    </div>
                </div>
                <div>

                </div>
            </div>
            <div style={{ border: '1px solid #fff', position: 'absolute', bottom: 60, left: 20, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    {
                        output.map((t, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div>Input = </div>
                                    {
                                        JSON.stringify(t.inputs.map(t => t.toFixed(2)))
                                    }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div>Target = </div>
                                    {
                                        JSON.stringify(t.targets.map(t => t.toFixed(2)))
                                    }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div>Output = </div>
                                    {
                                        JSON.stringify(t.outputs.at(-1).data.map(t => t.map(w => w.toFixed(2))))
                                    }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <span>Accuracy = </span>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>{t.accuracy.toFixed(2)}</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div style={{ border: '1px solid #fff', position: 'absolute', bottom: 20, left: 20, right: 20, padding: 6, display: 'flex', justifyContent: 'center' }}>
                <button onClick={initialize}>
                    Re-Initialize
                </button>
                <button onClick={reset}>
                    Reset
                </button>
                <button onClick={step}>
                    Step
                </button>
                <button onClick={isPlaying ? stop : play}>
                    {isPlaying ? 'Stop' : 'Play'}
                </button>
                <button onClick={() => train(100)}>
                    100 epochs
                </button>
                <button onClick={() => train(1000)}>
                    1,000 epochs
                </button>
                <button onClick={() => train(10000)}>
                    10,000 epochs
                </button>
                <button onClick={() => train(100000)}>
                    100,000 epochs
                </button>
                Steps: {stepsCount}
                Accuracy: {(output.reduce((a, b) => a + b.accuracy, 0) / output.length).toFixed(2)}
            </div>
        </div>
    )
}

export default App
