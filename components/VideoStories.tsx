
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type VideoStory = {
  id: number;
  title: string;
  category: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  sort_order: number;
  is_active: boolean;
};

type Settings = {
  is_enabled: boolean;
  title: string;
  show_count: number;
};

function getYoutubeId(input: string) {
  let source = input.trim();

  if (source.includes("<iframe")) {
    const match = source.match(/src=["']([^"']+)["']/);
    source = match ? match[1] : "";
  }

  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();

    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/")[1] || "";
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      id =
        url.searchParams.get("v") ||
        url.pathname.match(
          /^\/(?:embed|shorts|live)\/([^/]+)/
        )?.[1] ||
        "";
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? id
      : "";
  } catch {
    return "";
  }
}

function getYoutubeEmbedUrl(input: string) {
  const id = getYoutubeId(input);

  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
    : "";
}

function getPreviewUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&loop=1&playlist=${id}&disablekb=1&fs=0`;
}

function categoryColor(category: string | null) {
  const value = (category || "").toLowerCase();

  if (
    value.includes("tech") ||
    value.includes("teknologji") ||
    value.includes("auto")
  ) return "#46de88";

  if (value.includes("sport")) return "#60a5fa";
  if (value.includes("ekonomi")) return "#fbbf24";
  if (value.includes("kultur")) return "#c084fc";
  if (value.includes("magazina")) return "#c084fc";
  if (value.includes("fun")) return "#fb923c";

  return "#ff5570";
}

function PlayIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function ArrowIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d={
          direction === "left"
            ? "m15 6-6 6 6 6"
            : "m9 6 6 6-6 6"
        }
      />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m16 9 6 6" />
      <path d="m22 9-6 6" />
    </svg>
  );
}

export default function VideoStories() {
  const [videos, setVideos] = useState<VideoStory[]>([]);

  const [settings, setSettings] =
    useState<Settings | null>(null);

  const [selectedVideo, setSelectedVideo] =
    useState<VideoStory | null>(null);

  const [hoveredVideo, setHoveredVideo] =
    useState<number | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isMouseOver = useRef(false);

  const hoverTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const pointerPosition = useRef({
    x: 0,
    y: 0,
  });

  const dragState = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });

  const preventClick = useRef(false);

  /* STOP PREVIEW */

  function stopPreview() {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }

    setHoveredVideo(null);
  }

  /* START PREVIEW */

  function startPreview(id: number) {
    stopPreview();

    if (
      selectedVideo ||
      dragState.current.active
    ) return;

    hoverTimer.current = setTimeout(() => {
      if (
        !dragState.current.active &&
        !document.hidden &&
        document.hasFocus()
      ) {
        setHoveredVideo(id);
      }

      hoverTimer.current = null;
    }, 350);
  }

  /* SUPABASE */

  useEffect(() => {
    let active = true;

    async function fetchVideoStories() {
      try {
        const {
          data: settingsData,
          error,
        } = await supabase
          .from("video_story_settings")
          .select("is_enabled,title,show_count")
          .limit(1)
          .single();

        if (!active) return;

        if (
          error ||
          !settingsData ||
          !settingsData.is_enabled
        ) {
          setSettings(null);
          setVideos([]);
          return;
        }

        setSettings(settingsData);

        const {
          data: videosData,
          error: videosError,
        } = await supabase
          .from("video_stories")
          .select("*")
          .eq("is_active", true)
          .order("created_at", {
            ascending: false,
          })
          .limit(settingsData.show_count || 4);

        if (!active) return;

        if (videosError) {
          console.error(videosError);
          return;
        }

        setVideos(
          (videosData || []) as VideoStory[]
        );
      } catch (error) {
        console.error(error);
      }
    }

    fetchVideoStories();

    return () => {
      active = false;
    };
  }, []);

  /* CLEANUP */

  useEffect(() => {
    return () => {
      if (hoverTimer.current !== null) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  /* SCROLL, DRAG AND KEYBOARD */

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    const carousel = element;

    let scrollTimer:
      | ReturnType<typeof setTimeout>
      | null = null;

    function clearPreview() {
      if (hoverTimer.current !== null) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }

      setHoveredVideo(null);
    }

    function updateScroll() {
      setCanScrollLeft(
        carousel.scrollLeft > 2
      );

      setCanScrollRight(
        carousel.scrollLeft +
          carousel.clientWidth <
          carousel.scrollWidth - 2
      );
    }

    function resumePreview() {
      if (
        selectedVideo ||
        !isMouseOver.current ||
        dragState.current.active ||
        document.hidden ||
        !document.hasFocus()
      ) return;

      const { x, y } = pointerPosition.current;

      const target =
        document.elementFromPoint(x, y);

      const card = target?.closest<HTMLElement>(
        "[data-video-id]"
      );

      if (
        !card ||
        !carousel.contains(card)
      ) return;

      const id = Number(card.dataset.videoId);

      if (!Number.isFinite(id)) return;

      clearPreview();

      hoverTimer.current = setTimeout(() => {
        if (
          !dragState.current.active &&
          !document.hidden &&
          document.hasFocus()
        ) {
          setHoveredVideo(id);
        }

        hoverTimer.current = null;
      }, 350);
    }

    function schedulePreview() {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(
        resumePreview,
        200
      );
    }

    /* SCROLL EVENT */

    function handleScroll() {
      updateScroll();
      clearPreview();

      if (!dragState.current.active) {
        schedulePreview();
      }
    }

    /* MOUSE WHEEL */

    function handleWheel(event: WheelEvent) {
      if (
        selectedVideo ||
        event.ctrlKey
      ) return;

      const rawDelta =
        Math.abs(event.deltaX) >
        Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      const delta =
        event.deltaMode === 1
          ? rawDelta * 16
          : event.deltaMode === 2
            ? rawDelta * carousel.clientWidth
            : rawDelta;

      const max =
        carousel.scrollWidth -
        carousel.clientWidth;

      if (max <= 2) return;

      const current = carousel.scrollLeft;

      const canMove =
        (delta > 0 && current < max - 1) ||
        (delta < 0 && current > 1);

      if (!canMove) return;

      event.preventDefault();

      clearPreview();

      carousel.scrollLeft += delta;

      schedulePreview();
    }

    /* MOUSE CLICK AND DRAG */

    function handleMouseDown(event: MouseEvent) {
      if (
        event.button !== 0 ||
        selectedVideo
      ) return;

      const max =
        carousel.scrollWidth -
        carousel.clientWidth;

      preventClick.current = false;

      if (max <= 2) return;

      dragState.current = {
        active: true,
        moved: false,
        startX: event.clientX,
        scrollLeft: carousel.scrollLeft,
      };

      clearPreview();

      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
    }

    function handleMouseMove(event: MouseEvent) {
      pointerPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      if (!dragState.current.active) return;

      if ((event.buttons & 1) === 0) {
        finishDrag();
        return;
      }

      const distance =
        event.clientX -
        dragState.current.startX;

      if (
        Math.abs(distance) > 5 ||
        dragState.current.moved
      ) {
        event.preventDefault();

        dragState.current.moved = true;
        preventClick.current = true;

        setIsDragging(true);
        clearPreview();

        carousel.scrollLeft =
          dragState.current.scrollLeft -
          distance * 1.2;
      }
    }

    function finishDrag() {
      if (!dragState.current.active) return;

      const wasMoved =
        dragState.current.moved;

      dragState.current.active = false;

      setIsDragging(false);

      if (wasMoved) {
        preventClick.current = true;
      }

      updateScroll();
      schedulePreview();
    }

    function handleClickCapture(event: MouseEvent) {
      if (
        preventClick.current &&
        event.detail !== 0
      ) {
        event.preventDefault();
        event.stopPropagation();

        preventClick.current = false;
      }
    }

    function preventNativeDrag(event: DragEvent) {
      event.preventDefault();
    }

    /* KEYBOARD LEFT AND RIGHT */

    function handleKeyboard(event: KeyboardEvent) {
      if (
        selectedVideo ||
        dragState.current.active
      ) return;

      const hasFocus = carousel.contains(
        document.activeElement
      );

      if (
        !isMouseOver.current &&
        !hasFocus
      ) return;

      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.closest(
            "input, textarea, select"
          ) ||
          target.isContentEditable
        )
      ) return;

      if (
        event.key !== "ArrowRight" &&
        event.key !== "ArrowLeft"
      ) return;

      const max =
        carousel.scrollWidth -
        carousel.clientWidth;

      if (max <= 2 && !hasFocus) return;

      event.preventDefault();

      clearPreview();

      const direction =
        event.key === "ArrowRight" ? 1 : -1;

      const firstCard =
        carousel.firstElementChild;

      const gap =
        parseFloat(
          window.getComputedStyle(carousel)
            .columnGap
        ) || 12;

      const distance = firstCard
        ? firstCard.getBoundingClientRect().width +
          gap
        : 175;

      if (hasFocus) {
        const cards = Array.from(
          carousel.querySelectorAll<HTMLButtonElement>(
            "button[data-open-video]"
          )
        );

        const currentIndex = cards.indexOf(
          document.activeElement as HTMLButtonElement
        );

        if (currentIndex >= 0) {
          const nextIndex = Math.max(
            0,
            Math.min(
              cards.length - 1,
              currentIndex + direction
            )
          );

          const nextCard = cards[nextIndex];

          nextCard?.focus({
            preventScroll: true,
          });

          nextCard?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });

          return;
        }
      }

      carousel.scrollBy({
        left: direction * distance,
        behavior: "smooth",
      });

      schedulePreview();
    }

    /* STOP WHEN WINDOW LOSES FOCUS */

    function handleBlur() {
      finishDrag();

      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }

      clearPreview();
      isMouseOver.current = false;
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        handleBlur();
      }
    }

    const observer =
      new ResizeObserver(updateScroll);

    observer.observe(carousel);

    Array.from(carousel.children).forEach(
      (child) => observer.observe(child)
    );

    carousel.addEventListener(
      "scroll",
      handleScroll
    );

    carousel.addEventListener(
      "wheel",
      handleWheel,
      { passive: false }
    );

    carousel.addEventListener(
      "mousedown",
      handleMouseDown
    );

    carousel.addEventListener(
      "click",
      handleClickCapture,
      true
    );

    carousel.addEventListener(
      "dragstart",
      preventNativeDrag
    );

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      finishDrag
    );

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    updateScroll();

    return () => {
      observer.disconnect();

      carousel.removeEventListener(
        "scroll",
        handleScroll
      );

      carousel.removeEventListener(
        "wheel",
        handleWheel
      );

      carousel.removeEventListener(
        "mousedown",
        handleMouseDown
      );

      carousel.removeEventListener(
        "click",
        handleClickCapture,
        true
      );

      carousel.removeEventListener(
        "dragstart",
        preventNativeDrag
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        finishDrag
      );

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }

      if (hoverTimer.current !== null) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
    };
  }, [videos, selectedVideo]);

  /* VIDEO PLAYER MODAL */

  useEffect(() => {
    if (!selectedVideo) return;

    const dialog = dialogRef.current;

    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      document.body.style.overflow =
        oldOverflow;
    };
  }, [selectedVideo]);

  /* NAVIGATION BUTTONS */

  function scrollVideos(
    direction: "left" | "right"
  ) {
    const element = scrollRef.current;

    if (!element) return;

    stopPreview();

    element.scrollBy({
      left:
        direction === "left"
          ? -element.clientWidth * 0.8
          : element.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  /* OPEN VIDEO */

  function openVideo(video: VideoStory) {
    if (dragState.current.active) return;

    stopPreview();

    isMouseOver.current = false;

    setSelectedVideo(video);
  }

  if (!settings || videos.length === 0) {
    return null;
  }

  const embedUrl = selectedVideo
    ? getYoutubeEmbedUrl(
        selectedVideo.youtube_url
      )
    : "";

  return (
    <>
      <section className="w-full min-w-0 max-w-full overflow-hidden bg-white p-4 sm:p-5">

        {/* HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">

          <div className="flex items-center gap-2.5">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dc123c] text-white">

              <PlayIcon />

            </span>

            <h2 className="text-lg font-extrabold tracking-tight text-[#151515] sm:text-xl">

              {settings.title || "Video Stories"}

            </h2>

          </div>

          <Link
            href="/videos"
            className="flex items-center gap-2 text-[11px] font-extrabold text-[#dc123c] hover:underline sm:text-xs"
          >
            Shiko të gjitha
            <span>↗</span>
          </Link>

        </div>

        {/* VIDEO CAROUSEL */}

        <div
          ref={scrollRef}
          aria-label="Video Stories"
          tabIndex={0}
          onMouseEnter={(event) => {
            isMouseOver.current = true;

            pointerPosition.current = {
              x: event.clientX,
              y: event.clientY,
            };
          }}
          onMouseLeave={() => {
            isMouseOver.current = false;
            stopPreview();
          }}
          className={`flex w-full min-w-0 max-w-full select-none gap-3 overflow-x-auto overflow-y-hidden pb-2 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }`}
          style={{
            scrollSnapType: "none",
            scrollBehavior: "auto",
            touchAction: "pan-x pan-y",
          }}
        >

          {videos.map((video) => {
            const youtubeId =
              getYoutubeId(video.youtube_url);

            const thumbnail =
              video.thumbnail_url ||
              (
                youtubeId
                  ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
                  : ""
              );

            const isPlaying = Boolean(
              hoveredVideo === video.id &&
              youtubeId &&
              !selectedVideo &&
              !isDragging
            );

            return (
              <div
                key={video.id}
                data-video-id={video.id}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType === "mouse" &&
                    !dragState.current.active
                  ) {
                    startPreview(video.id);
                  }
                }}
                onPointerLeave={stopPreview}
                className="group relative flex w-[145px] shrink-0 flex-col overflow-hidden rounded-xl bg-[#15171b] text-left text-white transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-[#dc123c] sm:w-[160px] xl:w-[175px]"
              >

                {/* VIDEO COVER */}

                <div className="relative aspect-[9/16] w-full overflow-hidden bg-[#25282e]">

                  {/* THUMBNAIL */}

                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/15" />

                  {/* HOVER AUTOPLAY */}

                  {isPlaying && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 overflow-hidden bg-black"
                    >

                      <iframe
                        src={getPreviewUrl(youtubeId)}
                        title={`Preview: ${video.title}`}
                        tabIndex={-1}
                        className="pointer-events-none absolute inset-0 h-full w-full border-0"
                        allow="autoplay; encrypted-media"
                        referrerPolicy="strict-origin-when-cross-origin"
                      />

                    </div>
                  )}

                  {/* VIDEO DURATION */}

                  {video.duration && !isPlaying && (
                    <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">

                      {video.duration}

                    </span>
                  )}

                  {/* PLAY ICON */}

                  {!isPlaying && (
                    <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:border-[#dc123c] group-hover:bg-[#dc123c]">

                      <PlayIcon className="ml-0.5 h-6 w-6" />

                    </span>
                  )}

                  {/* PREVIEW INDICATOR */}

                  {isPlaying && (
                    <div className="pointer-events-none absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1.5 backdrop-blur-sm">

                      <span className="relative flex h-1.5 w-1.5">

                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4058] opacity-75" />

                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff4058]" />

                      </span>

                      <span className="text-[8px] font-extrabold tracking-wide text-white">

                        PREVIEW

                      </span>

                    </div>
                  )}

                  {/* MUTED INDICATOR */}

                  {isPlaying && (
                    <span className="pointer-events-none absolute bottom-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm">

                      <MutedIcon />

                    </span>
                  )}

                  {/* BRAND */}

                  <span className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-[8px] font-extrabold tracking-widest text-white">

                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff4058]" />

                    TEMPULLI

                  </span>

                </div>

                {/* VIDEO INFORMATION */}

                <div className="flex min-h-[95px] w-full flex-1 flex-col p-3">

                  <p
                    className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider"
                    style={{
                      color: categoryColor(
                        video.category
                      ),
                    }}
                  >

                    {video.category || "VIDEO"}

                  </p>

                  <h3 className="line-clamp-3 text-[13px] font-extrabold leading-snug text-white">

                    {video.title}

                  </h3>

                </div>

                {/* CLICKABLE AREA */}

                <button
                  type="button"
                  data-open-video
                  aria-label={`Shiko: ${video.title}`}
                  draggable={false}
                  onClick={() => openVideo(video)}
                  className={`absolute inset-0 z-30 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#dc123c] ${
                    isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                  }`}
                />

              </div>
            );
          })}

        </div>

        {/* CAROUSEL NAVIGATION */}

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">

          <div className="flex flex-wrap items-center gap-2">

            <span className="text-[10px] font-medium text-gray-400">

              ↔ Rrëshqit për më shumë

            </span>

            <div className="hidden items-center gap-1 lg:flex">

              <span className="flex h-5 w-5 items-center justify-center rounded border border-gray-200 bg-gray-50 text-[11px] text-gray-500">

                ←

              </span>

              <span className="flex h-5 w-5 items-center justify-center rounded border border-gray-200 bg-gray-50 text-[11px] text-gray-500">

                →

              </span>

            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            <button
              type="button"
              aria-label="Videot e mëparshme"
              disabled={!canScrollLeft}
              onClick={() => scrollVideos("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#dc123c] hover:text-[#dc123c] disabled:opacity-25"
            >

              <ArrowIcon direction="left" />

            </button>

            <button
              type="button"
              aria-label="Videot e radhës"
              disabled={!canScrollRight}
              onClick={() => scrollVideos("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#dc123c] hover:text-[#dc123c] disabled:opacity-25"
            >

              <ArrowIcon direction="right" />

            </button>

          </div>

        </div>

        {/* FOOTER */}

        <div className="mt-3 flex items-center justify-center gap-1.5">

          <span className="h-1.5 w-1.5 rounded-full bg-[#dc123c]" />

          <span className="text-[9px] font-bold tracking-widest text-gray-400">

            TEMPULLI VIDEO

          </span>

        </div>

      </section>

      {/* VIDEO PLAYER MODAL */}

      {selectedVideo && (
        <dialog
          ref={dialogRef}
          aria-label={selectedVideo.title}
          onCancel={(event) => {
            event.preventDefault();
            setSelectedVideo(null);
          }}
          onClick={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedVideo(null);
            }
          }}
          className="fixed inset-0 m-auto max-h-[90dvh] w-[92vw] max-w-4xl overflow-y-auto rounded-2xl bg-[#15171b] p-3 text-white shadow-2xl backdrop:bg-black/85 backdrop:backdrop-blur-sm sm:p-5"
        >

          {/* MODAL HEADER */}

          <div className="mb-4 flex items-center justify-between gap-4">

            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dc123c]">

                <PlayIcon />

              </span>

              <span className="text-xs font-extrabold tracking-widest">

                TEMPULLI VIDEO

              </span>

            </div>

            <button
              type="button"
              autoFocus
              aria-label="Mbyll videon"
              onClick={() => setSelectedVideo(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20"
            >

              ×

            </button>

          </div>

          {/* VIDEO PLAYER */}

          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">

            {embedUrl ? (
              <iframe
                key={selectedVideo.id}
                src={embedUrl}
                title={selectedVideo.title}
                className="h-full w-full border-0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-400">

                Linku i videos nuk është valid.

              </div>
            )}

          </div>

          {/* VIDEO DETAILS */}

          <div className="px-1 pt-4">

            <p
              className="mb-2 text-[11px] font-extrabold uppercase tracking-wider"
              style={{
                color: categoryColor(
                  selectedVideo.category
                ),
              }}
            >

              {selectedVideo.category || "VIDEO"}

            </p>

            <h3 className="text-xl font-extrabold leading-snug text-white">

              {selectedVideo.title}

            </h3>

            {selectedVideo.duration && (
              <p className="mt-2 text-xs text-gray-400">

                Kohëzgjatja: {selectedVideo.duration}

              </p>
            )}

          </div>

        </dialog>
      )}

    </>
  );
}
