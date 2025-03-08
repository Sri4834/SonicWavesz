
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const audioElement = new Audio()
  const playBtn = document.getElementById("play")
  const prevBtn = document.getElementById("prev")
  const nextBtn = document.getElementById("next")
  const progressBar = document.getElementById("progress")
  const progressContainer = document.querySelector(".progress-bar")
  const currentTimeEl = document.getElementById("current-time")
  const durationEl = document.getElementById("duration")
  const volumeSlider = document.getElementById("volume")
  const albumArt = document.getElementById("album-art")
  const songTitle = document.getElementById("song-title")
  const songArtist = document.getElementById("song-artist")
  const playlistItems = document.getElementById("playlist-items")
  const visualizer = document.getElementById("visualizer")

  // Audio Context for Visualizer
  let audioContext
  let analyser
  let source
  const canvasContext = visualizer.getContext("2d")
  let animationId

  // Set canvas size
  visualizer.width = visualizer.offsetWidth
  visualizer.height = visualizer.offsetHeight

  // Sample playlist - in a real app, you might load this from an API
  const songs = [
    {
      title: "Devara Thandavam",
      artist: "Anirudh Ravichander",
      src: "Devara Thandavam.mp3",
      cover: "https://i.scdn.co/image/ab67616d00001e025280788ee7502153c9377477",
    },
    {
      title: "Devara: All Hail Tiger",
      artist: "Anirudh Ravichander",
      src: "All Hail The Tiger.mp3",
      cover: "https://i.scdn.co/image/ab67616d00001e02f4920fea00e57158f540baaa",
    },
    {
      title: "Solo Levelling",
      artist: "SawanoHiroyuki & TOMORROW X TOGETHER Band",
      src: "Dfark Solo Levelling Intro.mp3",
      cover: "https://motionbgs.com/media/5261/solo-leveling-arise.jpg",
    },
    {
      title: "Devara: Ayudha Pooja",
      artist: "Kala Bhairava",
      src: "Ayudha Pooja.mp3",
      cover: "https://i.scdn.co/image/ab67616d00001e02ace943da67db014bbcbbf1c1",
    },
  ]

  // Current song index
  let songIndex = 0

  // Initialize player
  function initPlayer() {
    // Load songs from localStorage
    loadSongsFromLocalStorage();

    // Load first song
    if (songs.length > 0) {
      loadSong(songs[songIndex]);
    }

    // Create playlist items
    renderPlaylist();

    // Set initial volume
    audioElement.volume = volumeSlider.value;

    // Setup audio context for visualizer when user interacts
    playBtn.addEventListener("click", () => {
      if (!audioContext) {
        setupAudioContext();
      }
      togglePlay();
    });
  }
  // Setup Audio Context for visualizer
  function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    source = audioContext.createMediaElementSource(audioElement)

    source.connect(analyser)
    analyser.connect(audioContext.destination)

    analyser.fftSize = 256

    // Start visualizer
    visualize()
  }

  // Render the playlist
  function renderPlaylist() {
    playlistItems.innerHTML = ""
    songs.forEach((song, index) => {
      const li = document.createElement("li")
      li.textContent = `${song.title} - ${song.artist}`
      li.dataset.index = index

      if (index === songIndex) {
        li.classList.add("active")
      }

      li.addEventListener("click", () => {
        songIndex = Number.parseInt(li.dataset.index)
        loadSong(songs[songIndex])
        if (!audioContext) {
          setupAudioContext()
        }
        playAudio()
      })

      playlistItems.appendChild(li)
    })
  }

  // Load song details
  function loadSong(song) {
    songTitle.textContent = song.title || "Unknown Title";
    songArtist.textContent = song.artist || "Unknown Artist";
    albumArt.src = song.cover || "default.png"; // Use default.png if no cover is provided
    audioElement.src = song.src;

    // Set background based on song type
    const backgroundBlur = document.getElementById('background-blur');
    if (song.background) {
      // For unknown songs, use VidBg.mkv as the background video
      backgroundBlur.innerHTML = `<video autoplay muted loop id="bg-video">
                                  <source src="${song.background}" type="video/mp4">
                                  Your browser does not support the video tag.
                               </video>`;
    } else {
      // For known songs, use the cover image as the background
      backgroundBlur.style.backgroundImage = `url(${song.cover})`;
      backgroundBlur.innerHTML = ""; // Clear any existing video
    }

    // Update active playlist item
    document.querySelectorAll("#playlist-items li").forEach((item, index) => {
      if (index === songIndex) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Play/Pause toggle
  function togglePlay() {
    if (audioElement.paused) {
      playAudio()
    } else {
      pauseAudio()
    }
  }

  // Play audio
  function playAudio() {
    audioElement.play()
    playBtn.innerHTML = '<i class="fas fa-pause" style="color:white;" onMouseOver="this.style.color=\'white\'" onMouseOut="this.style.color=\'white\'"></i>'
    document.querySelector(".album-cover").classList.add("playing")
  }

  // Pause audio
  function pauseAudio() {
    audioElement.pause()
    playBtn.innerHTML = '<i class="fas fa-play" style="color:white;" onMouseOver="this.style.color=\'white\'" onMouseOut="this.style.color=\'white\'"></i>'
    document.querySelector(".album-cover").classList.remove("playing")
  }

  // Previous song
  function prevSong() {
    songIndex--
    if (songIndex < 0) {
      songIndex = songs.length - 1
    }
    loadSong(songs[songIndex])
    playAudio()
  }

  // Next song
  function nextSong() {
    songIndex++
    if (songIndex > songs.length - 1) {
      songIndex = 0
    }
    loadSong(songs[songIndex])
    playAudio()
  }

  // Update progress bar
  function updateProgress(e) {
    const { duration, currentTime } = e.target
    const progressPercent = (currentTime / duration) * 100
    progressBar.style.width = `${progressPercent}%`

    // Update time displays
    currentTimeEl.textContent = formatTime(currentTime)
    if (duration) {
      durationEl.textContent = formatTime(duration)
    }
  }

  // Format time to MM:SS
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    if (sec < 10) {
      return `${min}:0${sec}`
    } else { return `${min}:${sec}` }
    // return `${min}:${sec < 10 ? "0" + sec : sec}`
  }

  // Set progress bar on click
  function setProgress(e) {
    const width = this.clientWidth
    const duration = audioElement.duration
    audioElement.currentTime = (e.offsetX / width) * duration
  }

  // Visualizer function
  function visualize() {
    visualizer.width = visualizer.offsetWidth
    visualizer.height = visualizer.offsetHeight

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    canvasContext.clearRect(0, 0, visualizer.width, visualizer.height)

    function renderFrame() {
      animationId = requestAnimationFrame(renderFrame)

      analyser.getByteFrequencyData(dataArray)

      canvasContext.fillStyle = "rgb(18, 18, 18)"
      canvasContext.fillRect(0, 0, visualizer.width, visualizer.height)

      const barWidth = (visualizer.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * visualizer.height

        // Create gradient for bars
        const gradient = canvasContext.createLinearGradient(0, visualizer.height, 0, 0)
        gradient.addColorStop(0, "#1db954")
        gradient.addColorStop(1, "#1ed760")

        canvasContext.fillStyle = gradient
        canvasContext.fillRect(x, visualizer.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }
    renderFrame()
  }

  // Event Listeners
  prevBtn.addEventListener("click", prevSong)
  nextBtn.addEventListener("click", nextSong)
  audioElement.addEventListener("timeupdate", updateProgress)
  progressContainer.addEventListener("click", setProgress)

  // When song ends, play next song
  audioElement.addEventListener("ended", nextSong)

  // Volume control
  volumeSlider.addEventListener("input", function () {
    audioElement.volume = this.value
  })

  // Handle window resize for visualizer
  window.addEventListener("resize", () => {
    if (visualizer) {
      visualizer.width = visualizer.offsetWidth
      visualizer.height = visualizer.offsetHeight
    }
  })

  // Add song functionality

  const songFileInput = document.getElementById("fileup");

  songFileInput.addEventListener("change", () => {
    const file = songFileInput.files[0];
    if (file) {
      // Try to extract metadata if possible
      try {
        // Create a URL for the file
        const objectURL = URL.createObjectURL(file);

        // Create a temporary audio element to extract metadata
        const tempAudio = new Audio(objectURL);

        tempAudio.addEventListener('loadedmetadata', () => {
          // Try to get metadata
          let extractedTitle = file.name;
          let extractedArtist = "Unknown Artist";

          // If file name has format "Artist - Title.mp3", try to extract
          const nameMatch = file.name.match(/^(.*?)\s*-\s*(.*)\.(mp3|wav|ogg)$/i);
          if (nameMatch && nameMatch.length >= 3) {
            extractedArtist = nameMatch[1].trim();
            extractedTitle = nameMatch[2].trim();
          }

          const newSong = {
            title: extractedTitle,
            artist: extractedArtist,
            src: objectURL,
            cover: "default.png", // Default cover for uploaded songs
            background: "VidBg.mkv" // Default background video for unknown songs
          };

          songs.push(newSong);
          saveSongsToLocalStorage(); // Save to localStorage
          renderPlaylist();
          songFileInput.value = "";
        });

        tempAudio.addEventListener('error', () => {
          // Handle metadata extraction error, fall back to default values
          const newSong = {
            title: file.name,
            artist: "Unknown Artist",
            src: URL.createObjectURL(file),
            cover: "default.png", // Default cover for uploaded songs
            background: "VidBg.mkv" // Default background video for unknown songs
          };

          songs.push(newSong);
          saveSongsToLocalStorage(); // Save to localStorage
          renderPlaylist();
          songFileInput.value = "";
        });
      } catch (error) {
        // Fallback for any errors
        const newSong = {
          title: file.name,
          artist: "Unknown Artist",
          src: URL.createObjectURL(file),
          cover: "default.png", // Default cover for uploaded songs
          background: "VidBg.mkv" // Default background video for unknown songs
        };

        songs.push(newSong);
        saveSongsToLocalStorage(); // Save to localStorage
        renderPlaylist();
        songFileInput.value = "";
      }
    } else {
      alert("Please select a file to upload.");
    }
  });
  // Remove song functionality
  const removeSongBtn = document.getElementById("remove-song-btn");

  removeSongBtn.addEventListener("click", () => {
    const activeItem = document.querySelector("#playlist-items li.active");
    if (activeItem) {
      const index = Number.parseInt(activeItem.dataset.index);
      songs.splice(index, 1);
      saveSongsToLocalStorage(); // Update localStorage
      songIndex = 0; // Reset to the first song
      renderPlaylist();
      if (songs.length > 0) {
        loadSong(songs[songIndex]);
      } else {
        // If no songs are left, reset the player
        songTitle.textContent = "No Song";
        songArtist.textContent = "No Artist";
        albumArt.src = "default.png";
        audioElement.src = "";
        const backgroundBlur = document.getElementById('background-blur');
        backgroundBlur.style.backgroundImage = `url(default.png)`;
        backgroundBlur.innerHTML = ""; // Clear any existing video
      }
    } else {
      alert("Please select a song to remove.");
    }
  });

  // Initialize the player
  initPlayer()
})