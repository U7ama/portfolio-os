import React, { useEffect, useRef } from 'react';

interface DosInstance {
    stop: () => void;
}

interface DosOptions {
    url: string;
    pathPrefix: string;
    setNoCloud: boolean;
}

type DosPlayerFactory = (
    root: HTMLDivElement,
    options: DosOptions
) => DosInstance;

declare const Dos: DosPlayerFactory;

interface PlayerProps {
    width: number;
    height: number;
    bundleUrl: string;
}

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (rootRef.current === null) {
            return;
        }

        const instance = Dos(rootRef.current, {
            url: props.bundleUrl,
            pathPrefix: `${import.meta.env.BASE_URL}js-dos/emulators/`,
            setNoCloud: true,
        });

        return () => {
            instance.stop();
        };
    }, [props.bundleUrl]);

    return (
        <div
            ref={rootRef}
            style={{
                width: props.width,
                height: props.height,
                position: 'absolute',
            }}
        ></div>
    );
}
