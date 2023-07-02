import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { NeuralNetwork } from './NeuralNetwork2'
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas'

const config = {
    inputs: 2,
    structure: [3, 4, 3, 2],
    learningRate: 0.2,
}

const data = [
    {
        inputs: [0, 1],
        targets: [1, 0],
    },
    {
        inputs: [1, 0],
        targets: [0, 1],
    }
]

const getCanvas = (neuralNetwork, assessment) => {
    const inputs = assessment.inputs.map(t => ({ bias: t, output: t }))
    const layers = [inputs]

    neuralNetwork.network.forEach((layer, j) => {
        layers.push([])
        layer.weights.data.map((weights, i) => {
            layers.at(-1).push({
                weights,
                bias: layer.bias.data[i][0],
                output: assessment.result[j + 1].data[i][0],
            })
        })
    })

    return layers;
}


const useML = ({ inputs, structure, learningRate } = {}) => {
    const intervalRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [stepsCount, step] = useReducer(stepsCount => stepsCount + 1, 0)
    const [output, setOutput] = useState([])
    const [neuralNetwork] = useState(() => new NeuralNetwork(inputs, structure, learningRate))
    const [canvas, setCanvas] = useState([])

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
            data.map(({ inputs, targets }) => neuralNetwork.train(inputs, targets))
        }
        step()
    }

    useMemo(() => {
        data.map(({ inputs, targets }) => neuralNetwork.train(inputs, targets))
        const output = neuralNetwork.assess(data)
        setOutput(output)
        setCanvas(output.map(assessment => getCanvas(neuralNetwork, assessment)))
    }, [stepsCount])

    return {
        play: () => setIsPlaying(true),
        stop: () => setIsPlaying(false),
        step,
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
        isPlaying,
        stepsCount,
        output,
        train,
        canvas,
    } = useML(config)

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <div style={{ width: 500, height: 100, border: '1px solid #fff', color: '#fff' }}>
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
                                        <div>Output = </div>
                                        {
                                            JSON.stringify(t.outputs.map(t => t.map(w => w.toFixed(2))))
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
                    {/* <div>
                        {
                            mlp.layers.map((layer, i) => (
                                <div key={i} style={{}}>
                                    {
                                        layer.map(t => (
                                            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                {t.weights.map((w, i) => (
                                                    <div key={i}>{w.toFixed(2)}</div>
                                                ))}
                                            </div>
                                        ))
                                    }
                                    {
                                        layer.map(t => (
                                            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                                <div>{t.bias.toFixed(2)}</div>
                                                <div>{t.output.toFixed(2)}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            ))
                        }

                    </div> */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex' }}>
                        {/* <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
                            <div>{input[0]}</div>
                        </div> */}
                        <NeuralNetworkCanvas network={canvas[0]} />
                        <NeuralNetworkCanvas network={canvas[1]} />
                    </div>
                    {/* <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', fontSize: '2rem' }}>
                        <div>{output}</div>
                    </div> */}
                    <div>
                        <div>
                            <button onClick={step}>
                                Step
                            </button>
                            <button onClick={isPlaying ? stop : play}>
                                {isPlaying ? 'Stop' : 'Play'}
                            </button>
                            <button onClick={() => train(10000)}>
                                10,000 epochs
                            </button>
                            <button onClick={() => train(100000)}>
                                100,000 epochs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
