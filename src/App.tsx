import React from 'react'
import { NeuralNetworkCanvas } from './NeuralNetworkCanvas'
import { useML } from './useML'

// const config = {
//     NNConfig: {
//         inputs: 2,
//         layers: [2],
//         outputs: 2,
//         learningRate: 0.2,
//     },
//     data: [
//         {
//             inputs: [0, 1],
//             targets: [1, 1],
//         },
//         {
//             inputs: [1, 0],
//             targets: [1, 0],
//         },
//         {
//             inputs: [0, 0],
//             targets: [0, 1],
//         },
//         {
//             inputs: [1, 1],
//             targets: [0, 0],
//         }
//     ]
// }

const config = {
    NNConfig: {
        inputs: 3,
        layers: [3, 3],
        outputs: 2,
        learningRate: 0.2,
    },
    data: [
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
}

const App: React.FC = () => {
    const {
        play,
        stop,
        incrementStep,
        reset,
        initialize,
        isPlaying,
        step,
        output,
        train,
        canvas,
        setNeuralNetworkKey,
    } = useML(config.NNConfig, config.data);

    return (
        <div style={{ height: '100%', position: 'relative', fontSize: '20px', color: '#fff' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, flex: 1, position: 'relative' }}>
                <div style={{ display: 'flex', flex: 1, zoom: '50%' }}>
                    <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                        {
                            canvas.map((c, i) => (
                                <div key={i} style={{ display: 'flex', flex: 1, position: 'relative', flexDirection: 'column' }}>
                                    {
                                        c.map((d, j) => (
                                            <NeuralNetworkCanvas key={i * c.length + j} network={d} />
                                        ))
                                    }
                                </div>
                            ))
                        }
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
                                        JSON.stringify(t.inputs.map(t => t))
                                    }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div>Target = </div>
                                    {
                                        JSON.stringify(t.targets.map(t => t))
                                    }
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <div>Output = </div>
                                    {
                                        JSON.stringify(t.outputs[t.outputs.length - 1].toArray().map(t => t.toFixed(2)))
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
                <select onChange={e => setNeuralNetworkKey(e.target.value as 'NN' | 'NN_ExponentialWeights')}>
                    <option value="NN">NN</option>
                    <option value="NN_ExponentialWeights">NN_ExponentialWeights</option>
                </select>
                <button onClick={initialize}>
                    Re-Initialize
                </button>
                <button onClick={reset}>
                    Reset
                </button>
                <button onClick={incrementStep}>
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
                Steps: {step}
                Accuracy: {(output.reduce((a, b) => a + b.accuracy, 0) / output.length).toFixed(2)}
            </div>
        </div>
    )
}

export default App
