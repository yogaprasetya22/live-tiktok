// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

// const express = require("express");
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const {
//     TikTokConnectionWrapper,
//     getGlobalConnectionCount,
// } = require("./connectionWrapper");
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
// import {
//     TikTokConnectionWrapper,
//     getGlobalConnectionCount,
// } from "./connectionWrapper";
import {
    TikTokConnectionWrapper,
    getGlobalConnectionCount,
} from "./connectionWrapper.js";

const app = express();
const httpServer = createServer(app);

// Enable cross origin resource sharing
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});
const port = process.env.PORT || 3020;

app.use(express.static("public"));

io.on("connection", (socket) => {
    let tiktokConnectionWrapper;

    socket.on("setUniqueId", (uniqueId, options) => {
        // Prohibit the client from specifying these options (for security reasons)
        if (typeof options === "object") {
            delete options.requestOptions;
            delete options.websocketOptions;
        }

        // Is the client already connected to a stream? => Disconnect
        if (tiktokConnectionWrapper) {
            tiktokConnectionWrapper.disconnect();
        }

        // Connect to the given username (uniqueId)
        try {
            tiktokConnectionWrapper = new TikTokConnectionWrapper(
                uniqueId,
                options,
                true
            );
            tiktokConnectionWrapper.connect();
        } catch (err) {
            socket.emit("disconnected", err.toString());
            return;
        }

        // Redirect wrapper control events once
        tiktokConnectionWrapper.once("connected", (state) =>
            socket.emit("tiktokConnected", state)
        );
        tiktokConnectionWrapper.once("disconnected", (reason) =>
            socket.emit("tiktokDisconnected", reason)
        );

        // Notify client when stream ends
        tiktokConnectionWrapper.connection.on("streamEnd", () =>
            socket.emit("streamEnd")
        );

        // Redirect message events
        tiktokConnectionWrapper.connection.on(
            "roomUser",
            (msg) => {
                let cbValue = {
                    type: "updateViewCount",
                    value: msg.viewerCount,
                };

                socket.emit("updateViewCount", JSON.stringify(cbValue));
            }
            // socket.emit("roomUser", msg)
        );
        tiktokConnectionWrapper.connection.on("member", (msg) =>
            socket.emit("member", msg)
        );
        tiktokConnectionWrapper.connection.on("chat", (msg) => {
            console.log(`${msg.uniqueId}: ${msg.comment}`);
            let cbValue = {
                type: "incomingChat",
                value: msg.comment,
                uName: msg.uniqueId,
                roles: [msg.isModerator, msg.isSubscriber, msg.rollowRole],
                pfp: msg.userDetails.profilePictureUrls[2],
            };

            socket.emit("newChat", JSON.stringify(cbValue));
        });

        tiktokConnectionWrapper.connection.on("gift", (msg) =>
            socket.emit("gift", msg)
        );
        tiktokConnectionWrapper.connection.on("social", (msg) =>
            socket.emit("social", msg)
        );
        tiktokConnectionWrapper.connection.on("like", (msg) =>
            socket.emit("like", msg)
        );
        tiktokConnectionWrapper.connection.on("questionNew", (msg) =>
            socket.emit("questionNew", msg)
        );
        tiktokConnectionWrapper.connection.on("linkMicBattle", (msg) =>
            socket.emit("linkMicBattle", msg)
        );
        tiktokConnectionWrapper.connection.on("linkMicArmies", (msg) =>
            socket.emit("linkMicArmies", msg)
        );
        tiktokConnectionWrapper.connection.on("liveIntro", (msg) =>
            socket.emit("liveIntro", msg)
        );
    });

    socket.on("disconnect", () => {
        if (tiktokConnectionWrapper) {
            tiktokConnectionWrapper.disconnect();
        }
    });
});

// Emit global connection statistics
setInterval(() => {
    io.emit("statistic", { globalConnectionCount: getGlobalConnectionCount() });
}, 5000);

httpServer.listen(port);
console.info(`Server running! Please visit http://localhost:${port}`);
