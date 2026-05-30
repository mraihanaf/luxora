"use client"

import dynamic from "next/dynamic"

const VideoTest = dynamic(() => import("@/components/video-test"), {
  ssr: false,
})

export default function VideoTestClient() {
  return <VideoTest />
}

