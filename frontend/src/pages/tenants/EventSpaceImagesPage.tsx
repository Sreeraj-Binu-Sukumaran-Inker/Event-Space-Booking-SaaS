import { useEffect, useMemo, useState } from "react";
import axios, { type AxiosError } from "axios";
import {
  deleteVenueImage,
  getVenueImages,
  getVenues,
  uploadVenueImages,
  type Venue,
  type VenueImage,
} from "../../services/venue.service";

const GOLD = "#d4af37";

type ApiError = { message?: string };

const isAxiosErrorWithMessage = (
  err: unknown
): err is AxiosError<ApiError> => axios.isAxiosError(err);

function formatCount(count: number) {
  return `${count} image${count === 1 ? "" : "s"}`;
}

export default function EventSpaceImagesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [images, setImages] = useState<VenueImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) ?? null,
    [venues, selectedVenueId]
  );

  useEffect(() => {
    const loadVenues = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVenues();
        setVenues(data);
        if (data.length > 0) setSelectedVenueId(data[0].id);
      } catch {
        setError("Failed to load event spaces.");
      } finally {
        setLoading(false);
      }
    };
    loadVenues();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedVenueId) {
        setImages([]);
        return;
      }
      try {
        setImagesLoading(true);
        setError(null);
        const data = await getVenueImages(selectedVenueId);
        setImages(data);
      } catch {
        setError("Failed to load images.");
      } finally {
        setImagesLoading(false);
      }
    };
    loadImages();
  }, [selectedVenueId]);

  const handleUpload = async (files: FileList | null) => {
    if (!selectedVenueId || !files || files.length === 0) return;
    try {
      setUploading(true);
      setError(null);
      const fileArray = Array.from(files);
      await uploadVenueImages(selectedVenueId, fileArray);
      const refreshed = await getVenueImages(selectedVenueId);
      setImages(refreshed);
    } catch (err: unknown) {
      if (isAxiosErrorWithMessage(err)) {
        setError(err.response?.data?.message ?? "Failed to upload images.");
      } else {
        setError("Failed to upload images.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!selectedVenueId) return;
    try {
      setError(null);
      await deleteVenueImage(selectedVenueId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: unknown) {
      if (isAxiosErrorWithMessage(err)) {
        setError(err.response?.data?.message ?? "Failed to delete image.");
      } else {
        setError("Failed to delete image.");
      }
    }
  };

  const openVenue = (venueId: string) => {
    setSelectedVenueId(venueId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden gap-5" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Event Space Images
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage photos for assigned event spaces.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex-shrink-0">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Event Space Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="text-sm text-gray-400">Loading event spaces...</div>
        ) : venues.length === 0 ? (
          <div className="text-sm text-gray-400">No event spaces available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {venues.map((venue) => (
              <button
                key={venue.id}
                onClick={() => openVenue(venue.id)}
                className="group text-left bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-[3/2] bg-gray-100 relative">
                  {venue.images?.[0]?.url ? (
                    <img
                      src={venue.images[0].url}
                      alt={venue.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">{venue.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {venue.city ?? venue.location}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image Manager Modal */}
      {isModalOpen && selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
            <div className="h-1.5" style={{ background: GOLD }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedVenue.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{formatCount(images.length)}</p>
              </div>
              <button
                onClick={closeModal}
                className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <label
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ background: GOLD, color: "#1c1917" }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={!selectedVenueId || uploading}
                  />
                  {uploading ? "Uploading..." : "Add Photos"}
                </label>
                {imagesLoading && <span className="text-xs text-gray-500">Loading images...</span>}
              </div>

              {imagesLoading ? (
                <div className="text-sm text-gray-400">Loading images...</div>
              ) : images.length === 0 ? (
                <div className="text-sm text-gray-400">No images uploaded yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="aspect-square bg-gray-100 relative">
                        <img src={img.url} alt="Event space" className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 truncate">
                          {selectedVenue?.name ?? ""}
                        </span>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="text-xs px-2 py-1 rounded-md text-red-600 hover:bg-red-50 border border-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
