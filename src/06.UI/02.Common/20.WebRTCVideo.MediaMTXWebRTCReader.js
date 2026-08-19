/**
 * @class
 * @memberof Colibri.UI
 */
Colibri.UI.WebRTCVideo.MediaMTXWebRTCReader = class {

    /**
     * Create a MediaMTXWebRTCReader.
     * @param {Conf} conf - configuration.
     * @constructor
     */
    constructor(conf) {
        this.retryPause = 2000;
        this.conf = conf;
        this.state = 'getting_codecs';
        this.restartTimeout = null;
        this.pc = null;
        this.offerData = null;
        this.sessionUrl = null;
        this.queuedCandidates = [];
        this.#getNonAdvertisedCodecs();
    }

    /**
     * Close the reader and all its resources.
     * @public
     */
    close() {
        this.state = 'closed';

        if (this.pc !== null) {
            this.pc.close();
        }

        if (this.restartTimeout !== null) {
            clearTimeout(this.restartTimeout);
        }
    }

    /**
     * Check if a codec is supported by the browser, even if it is not advertised in the offer.
     * @param {string} codec - codec name.
     * @param {string} fmtp - optional fmtp parameters.
     * @returns {Promise<boolean>} - true if the codec is supported, false otherwise.
     * @private
     * @ignore
     * @static
     */
    static #supportsNonAdvertisedCodec(codec, fmtp) {
        return new Promise((resolve) => {
            const pc = new RTCPeerConnection({ iceServers: [] });
            const mediaType = 'audio';
            let payloadType = '';

            pc.addTransceiver(mediaType, { direction: 'recvonly' });
            pc.createOffer()
                .then((offer) => {
                    if (offer.sdp === undefined) {
                        throw new Error('SDP not present');
                    }
                    if (offer.sdp.includes(` ${codec}`)) { // codec is advertised, there's no need to add it manually
                        throw new Error('already present');
                    }

                    const sections = offer.sdp.split(`m=${mediaType}`);

                    const payloadTypes = sections.slice(1)
                        .map((s) => s.split('\r\n')[0].split(' ').slice(3))
                        .reduce((prev, cur) => [...prev, ...cur], []);
                    payloadType = this.#reservePayloadType(payloadTypes);

                    const lines = sections[1].split('\r\n');
                    lines[0] += ` ${payloadType}`;
                    lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} ${codec}`);
                    if (fmtp !== undefined) {
                        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} ${fmtp}`);
                    }
                    sections[1] = lines.join('\r\n');
                    offer.sdp = sections.join(`m=${mediaType}`);
                    return pc.setLocalDescription(offer);
                })
                .then(() => (
                    pc.setRemoteDescription(new RTCSessionDescription({
                        type: 'answer',
                        sdp: 'v=0\r\n'
                            + 'o=- 6539324223450680508 0 IN IP4 0.0.0.0\r\n'
                            + 's=-\r\n'
                            + 't=0 0\r\n'
                            + 'a=fingerprint:sha-256 0D:9F:78:15:42:B5:4B:E6:E2:94:3E:5B:37:78:E1:4B:54:59:A3:36:3A:E5:05:EB:27:EE:8F:D2:2D:41:29:25\r\n'
                            + `m=${mediaType} 9 UDP/TLS/RTP/SAVPF ${payloadType}\r\n`
                            + 'c=IN IP4 0.0.0.0\r\n'
                            + 'a=ice-pwd:7c3bf4770007e7432ee4ea4d697db675\r\n'
                            + 'a=ice-ufrag:29e036dc\r\n'
                            + 'a=sendonly\r\n'
                            + 'a=rtcp-mux\r\n'
                            + `a=rtpmap:${payloadType} ${codec}\r\n`
                            + ((fmtp !== undefined) ? `a=fmtp:${payloadType} ${fmtp}\r\n` : ''),
                    }))
                ))
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                })
                .finally(() => {
                    pc.close();
                });
        });
    }

    /**
     * Unquote a credential value.
     * @param {string} v - The quoted credential value.
     * @returns {string} - The unquoted credential value.
     * @private
     * @static
     */
    static #unquoteCredential(v) {
        return JSON.parse(`"${v}"`);
    }

    /**
     * Parse the Link header and extract ICE servers.
     * @param {string} links - The Link header value.
     * @returns {Array} - An array of ICE server objects.
     * @private
     * @static
     */
    static #linkToIceServers(links) {
        return (links !== null) ? links.split(', ').map((link) => {
            const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i);
            const ret = {
                urls: [m[1]],
            };

            if (m[3] !== undefined) {
                ret.username = this.#unquoteCredential(m[3]);
                ret.credential = this.#unquoteCredential(m[4]);
                ret.credentialType = 'password';
            }

            return ret;
        }) : [];
    }

    /**
     * Parse an SDP offer and extract ICE ufrag, ICE pwd, and media lines.
     * @param {string} sdp - The SDP offer.
     * @returns {Object} - An object containing iceUfrag, icePwd, and medias.
     * @private
     * @static
     */
    static #parseOffer(sdp) {
        const ret = {
            iceUfrag: '',
            icePwd: '',
            medias: [],
        };

        for (const line of sdp.split('\r\n')) {
            if (line.startsWith('m=')) {
                ret.medias.push(line.slice('m='.length));
            } else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
                ret.iceUfrag = line.slice('a=ice-ufrag:'.length);
            } else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
                ret.icePwd = line.slice('a=ice-pwd:'.length);
            }
        }

        return ret;
    }

    /**
     * Reserve a payload type for a non-advertised codec.
     * @param {Array} payloadTypes - The list of currently used payload types.
     * @returns {string} - The reserved payload type.
     * @private
     * @static
     */
    static #reservePayloadType(payloadTypes) {
        // everything is valid between 30 and 127, except for interval between 64 and 95
        // https://chromium.googlesource.com/external/webrtc/+/refs/heads/master/call/payload_type.h#29
        for (let i = 30; i <= 127; i++) {
            if ((i <= 63 || i >= 96) && !payloadTypes.includes(i.toString())) {
                const pl = i.toString();
                payloadTypes.push(pl);
                return pl;
            }
        }
        throw Error('unable to find a free payload type');
    }

    /**
     * Enable stereo PCMA/PCMU codecs in the SDP offer.
     * @param {Array} payloadTypes - The list of currently used payload types.
     * @param {string} section - The SDP media section.
     * @returns {string} - The modified SDP media section.
     * @private
     * @static
     */
    static #enableStereoPcmau(payloadTypes, section) {
        const lines = section.split('\r\n');

        let payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} PCMU/8000/2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} PCMA/8000/2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        return lines.join('\r\n');
    }

    /**
     * Enable multi-channel Opus codecs in the SDP offer.
     * @param {Array} payloadTypes - The list of currently used payload types.    
     * @param {string} section - The SDP media section.
     * @returns {string} - The modified SDP media section.
     * @private
     * @static
     */
    static #enableMultichannelOpus(payloadTypes, section) {
        const lines = section.split('\r\n');

        let payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/3`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,2,1;num_streams=2;coupled_streams=1`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/4`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,1,2,3;num_streams=2;coupled_streams=2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/5`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3;num_streams=3;coupled_streams=2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/6`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/7`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3,5,6;num_streams=4;coupled_streams=4`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/8`);
        lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,6,1,4,5,2,3,7;num_streams=5;coupled_streams=4`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        return lines.join('\r\n');
    }

    /**
     * Enable L16 codecs in the SDP offer.
     * @param {Array} payloadTypes - The list of currently used payload types.
     * @param {string} section - The SDP media section.
     * @returns {string} - The modified SDP media section.
     * @private
     * @static
     */
    static #enableL16(payloadTypes, section) {
        const lines = section.split('\r\n');

        let payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/8000/2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/16000/2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        payloadType = this.#reservePayloadType(payloadTypes);
        lines[0] += ` ${payloadType}`;
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/48000/2`);
        lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`);

        return lines.join('\r\n');
    }

    /**
     * Enable stereo for Opus codec in the SDP media section.
     * @param {string} section - The SDP media section.
     * @returns {string} - The modified SDP media section.
     * @private
     * @static
     */
    static #enableStereoOpus(section) {
        let opusPayloadFormat = '';
        const lines = section.split('\r\n');

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
                opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0];
                break;
            }
        }

        if (opusPayloadFormat === '') {
            return section;
        }

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(`a=fmtp:${opusPayloadFormat} `)) {
                if (!lines[i].includes('stereo')) {
                    lines[i] += ';stereo=1';
                }
                if (!lines[i].includes('sprop-stereo')) {
                    lines[i] += ';sprop-stereo=1';
                }
            }
        }

        return lines.join('\r\n');
    }

    /**
     * Edit the SDP offer to enable stereo Opus and add non-advertised codecs.
     * @param {string} sdp - The SDP offer.
     * @param {Array} nonAdvertisedCodecs - The list of non-advertised codecs to add.
     * @returns {string} - The modified SDP offer.
     * @private
     * @static
     */
    static #editOffer(sdp, nonAdvertisedCodecs) {
        const sections = sdp.split('m=');

        const payloadTypes = sections.slice(1)
            .map((s) => s.split('\r\n')[0].split(' ').slice(3))
            .reduce((prev, cur) => [...prev, ...cur], []);

        for (let i = 1; i < sections.length; i++) {
            if (sections[i].startsWith('audio')) {
                sections[i] = this.#enableStereoOpus(sections[i]);

                if (nonAdvertisedCodecs.includes('pcma/8000/2')) {
                    sections[i] = this.#enableStereoPcmau(payloadTypes, sections[i]);
                }
                if (nonAdvertisedCodecs.includes('multiopus/48000/6')) {
                    sections[i] = this.#enableMultichannelOpus(payloadTypes, sections[i]);
                }
                if (nonAdvertisedCodecs.includes('L16/48000/2')) {
                    sections[i] = this.#enableL16(payloadTypes, sections[i]);
                }

                break;
            }
        }

        return sections.join('m=');
    }

    /**
     * Generate an SDP fragment containing ICE ufrag, ICE pwd, and candidates.
     * @param {Object} od - The offer data containing iceUfrag, icePwd, and medias.
     * @param {Array} candidates - The list of ICE candidates.
     * @returns {string} - The generated SDP fragment.
     * @private
     * @static
     */
    static #generateSdpFragment(od, candidates) {
        const candidatesByMedia = {};
        for (const candidate of candidates) {
            const mid = candidate.sdpMLineIndex;
            if (candidatesByMedia[mid] === undefined) {
                candidatesByMedia[mid] = [];
            }
            candidatesByMedia[mid].push(candidate);
        }

        let frag = `a=ice-ufrag:${od.iceUfrag}\r\n`
            + `a=ice-pwd:${od.icePwd}\r\n`;

        let mid = 0;

        for (const media of od.medias) {
            if (candidatesByMedia[mid] !== undefined) {
                frag += `m=${media}\r\n`
                    + `a=mid:${mid}\r\n`;

                for (const candidate of candidatesByMedia[mid]) {
                    frag += `a=${candidate.candidate}\r\n`;
                }
            }
            mid++;
        }

        return frag;
    }

    /**
     * Handle an error that occurs during the WebRTC connection process.
     * @param {string} err - The error message.
     * @private
     * @ignore
     */
    #handleError(err) {
        if (this.state === 'running') {
            if (this.pc !== null) {
                this.pc.close();
                this.pc = null;
            }

            this.offerData = null;

            if (this.sessionUrl !== null) {
                fetch(this.sessionUrl, {
                    method: 'DELETE',
                });
                this.sessionUrl = null;
            }

            this.queuedCandidates = [];
            this.state = 'restarting';

            this.restartTimeout = window.setTimeout(() => {
                this.restartTimeout = null;
                this.state = 'running';
                this.#start();
            }, this.retryPause);

            if (this.conf.onError !== undefined) {
                this.conf.onError(`${err}, retrying in some seconds`);
            }
        } else if (this.state === 'getting_codecs') {
            this.state = 'failed';

            if (this.conf.onError !== undefined) {
                this.conf.onError(err);
            }
        }
    }

    /**
     * Get the list of non-advertised codecs supported by the browser.
     * @private
     * @ignore
     */
    #getNonAdvertisedCodecs() {
        Promise.all([
            ['pcma/8000/2'],
            ['multiopus/48000/6', 'channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2'],
            ['L16/48000/2'],
        ]
            .map((c) => MediaMTXWebRTCReader.#supportsNonAdvertisedCodec(c[0], c[1]).then((r) => ((r) ? c[0] : false))))
            .then((c) => c.filter((e) => e !== false))
            .then((codecs) => {
                if (this.state !== 'getting_codecs') {
                    throw new Error('closed');
                }

                this.nonAdvertisedCodecs = codecs;
                this.state = 'running';
                this.#start();
            })
            .catch((err) => {
                this.#handleError(err);
            });
    }

    /**
     * Start the WebRTC connection process by requesting ICE servers, setting up the peer connection, sending the offer, and setting the answer.
     * @private
     * @ignore
     */
    #start() {
        this.#requestICEServers()
            .then((iceServers) => this.#setupPeerConnection(iceServers))
            .then((offer) => this.#sendOffer(offer))
            .then((answer) => this.#setAnswer(answer))
            .catch((err) => {
                this.#handleError(err.toString());
            });
    }

    /**
     * Get the authorization header for the WebRTC connection.
     * @private
     * @ignore
     */
    #authHeader() {
        if (this.conf.user !== undefined && this.conf.user !== '') {
            const credentials = btoa(`${this.conf.user}:${this.conf.pass}`);
            return { 'Authorization': `Basic ${credentials}` };
        }
        if (this.conf.token !== undefined && this.conf.token !== '') {
            return { 'Authorization': `Bearer ${this.conf.token}` };
        }
        return {};
    }

    /**
     * Request the ICE servers from the signaling server.
     * @private
     * @ignore
     */
    #requestICEServers() {
        return fetch(this.conf.url, {
            method: 'OPTIONS',
            headers: {
                ...this.#authHeader(),
            },
        })
            .then((res) => MediaMTXWebRTCReader.#linkToIceServers(res.headers.get('Link')));
    }

    /**
     * Set up the RTCPeerConnection with the given ICE servers, create an offer, and set the local description.
     * @param {Array} iceServers - The list of ICE servers.
     * @returns {Promise<string>} - A promise that resolves to the SDP offer.
     * @private
     * @ignore
     */
    #setupPeerConnection(iceServers) {
        if (this.state !== 'running') {
            throw new Error('closed');
        }

        this.pc = new RTCPeerConnection({
            iceServers,
            // https://webrtc.org/getting-started/unified-plan-transition-guide
            sdpSemantics: 'unified-plan',
        });

        const direction = 'recvonly';
        this.pc.addTransceiver('video', { direction });
        this.pc.addTransceiver('audio', { direction });

        // using data channels requires creating a data channel locally
        this.pc.createDataChannel('');

        this.pc.onicecandidate = (evt) => this.#onLocalCandidate(evt);
        this.pc.onconnectionstatechange = () => this.#onConnectionState();
        this.pc.ontrack = (evt) => this.#onTrack(evt);
        this.pc.ondatachannel = (evt) => this.#onDataChannel(evt);

        return this.pc.createOffer()
            .then((offer) => {
                offer.sdp = MediaMTXWebRTCReader.#editOffer(offer.sdp, this.nonAdvertisedCodecs);
                this.offerData = MediaMTXWebRTCReader.#parseOffer(offer.sdp);

                return this.pc.setLocalDescription(offer)
                    .then(() => offer.sdp);
            });
    }

    /**
     * Send the SDP offer to the signaling server.
     * @param {string} offer - The SDP offer.
     * @returns {Promise<string>} - A promise that resolves to the SDP answer.
     * @private
     * @ignore
     */
    #sendOffer(offer) {
        if (this.state !== 'running') {
            throw new Error('closed');
        }

        return fetch(this.conf.url, {
            method: 'POST',
            headers: {
                ...this.#authHeader(),
                'Content-Type': 'application/sdp',
            },
            body: offer,
        })
            .then((res) => {
                switch (res.status) {
                    case 201:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    case 400:
                        return res.json().then((e) => { throw new Error(e.error); });
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }

                this.sessionUrl = new URL(res.headers.get('location'), this.conf.url).toString();

                return res.text();
            });
    }

    /**
     * Set the remote description with the SDP answer received from the signaling server and send any queued ICE candidates.
     * @param {string} answer - The SDP answer.
     * @returns {Promise<void>} - A promise that resolves when the remote description is set and queued candidates are sent.
     * @private
     * @ignore
     */
    #setAnswer(answer) {
        if (this.state !== 'running') {
            throw new Error('closed');
        }

        return this.pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: answer,
        }))
            .then(() => {
                if (this.state !== 'running') {
                    return;
                }

                if (this.queuedCandidates.length !== 0) {
                    this.#sendLocalCandidates(this.queuedCandidates);
                    this.queuedCandidates = [];
                }
            });
    }

    /**
     * Handle the local ICE candidate event by sending the candidate to the signaling server if the session URL is available, or queueing it for later if not.
     * @param {RTCPeerConnectionIceEvent} evt - The ICE candidate event.
     * @private
     * @ignore
     */
    #onLocalCandidate(evt) {
        if (this.state !== 'running') {
            return;
        }

        if (evt.candidate !== null) {
            if (this.sessionUrl === null) {
                this.queuedCandidates.push(evt.candidate);
            } else {
                this.#sendLocalCandidates([evt.candidate]);
            }
        }
    }

    /**
     * Send the local ICE candidates to the signaling server using a PATCH request with the appropriate headers and SDP fragment.
     * @param {Array} candidates - The list of ICE candidates to send.
     * @private
     * @ignore
     */
    #sendLocalCandidates(candidates) {
        fetch(this.sessionUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/trickle-ice-sdpfrag',
                'If-Match': '*',
            },
            body: MediaMTXWebRTCReader.#generateSdpFragment(this.offerData, candidates),
        })
            .then((res) => {
                switch (res.status) {
                    case 204:
                        break;
                    case 404:
                        throw new Error('stream not found');
                    default:
                        throw new Error(`bad status code ${res.status}`);
                }
            })
            .catch((err) => {
                this.#handleError(err.toString());
            });
    }

    /**
     * Handle the connection state change event by checking if the connection state is "failed" or "closed" and calling the error handler if so.
     * @private
     * @ignore
     */
    #onConnectionState() {
        if (this.state !== 'running') {
            return;
        }

        // "closed" can arrive before "failed" and without
        // the close() method being called at all.
        // It happens when the other peer sends a termination
        // message like a DTLS CloseNotify.
        if (this.pc.connectionState === 'failed'
            || this.pc.connectionState === 'closed'
        ) {
            this.#handleError('peer connection closed');
        }
    }

    /**
     * Handle the track event by calling the onTrack callback if it is defined in the configuration.
     * @param {RTCTrackEvent} evt - The track event.
     * @private
     * @ignore
     */
    #onTrack(evt) {
        if (this.conf.onTrack !== undefined) {
            this.conf.onTrack(evt);
        }
    }

    /**
     * Handle the data channel event by calling the onDataChannel callback if it is defined in the configuration.
     * @param {RTCDataChannelEvent} evt - The data channel event.
     * @private
     * @ignore
     */
    #onDataChannel(evt) {
        if (this.conf.onDataChannel !== undefined) {
            this.conf.onDataChannel(evt);
        }
    }
}

window.MediaMTXWebRTCReader = Colibri.UI.WebRTCVideo.MediaMTXWebRTCReader;