import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import omitDeep from "omit-deep-lodash";

// API base URL (change as needed or set via environment variables)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
const GRAPHQL_URL = `${API_BASE_URL}/graphql`;
const UPLOAD_URL = `${API_BASE_URL}/upload`;

const ProfileScreen = () => {
  const { user, login } = useUserContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shippingAddresses: [],
    billingAddresses: [],
    phoneNumber: "",
    profilePictureUrl: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // For editing addresses or phone
  const [editingShippingIndex, setEditingShippingIndex] = useState(null);
  const [editingBillingIndex, setEditingBillingIndex] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  // Add an errors state and a phone‐regex constant
  const PHONE_REGEX = /^\d{10}$/; // or whatever pattern you prefer
  const [errors, setErrors] = useState({ phoneNumber: "" });

  // Track which address is primary
  const [primaryShippingIndex, setPrimaryShippingIndex] = useState(null);
  const [primaryBillingIndex, setPrimaryBillingIndex] = useState(null);




  // Initialize form data when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        shippingAddresses: user.shipping || [],
        billingAddresses: user.billing || [],
        phoneNumber: user.phone || "",
        profilePictureUrl: user.profilePictureUrl || "",
      });
      setPrimaryShippingIndex(
        typeof user.primaryShippingIndex === "number"
          ? user.primaryShippingIndex
          : user.shipping && user.shipping.length > 0
          ? 0
          : null
      );
      setPrimaryBillingIndex(
        typeof user.primaryBillingIndex === "number"
          ? user.primaryBillingIndex
          : user.billing && user.billing.length > 0
          ? 0
          : null
      );
      if (user.profilePictureUrl) {
        const fullUrl = `${API_BASE_URL}${user.profilePictureUrl}`;
        setProfilePicPreview(fullUrl);
      }
    }
  }, [user]);



  // --- Handlers for phone number ---



  // Enhance handlePhoneChange to validate as you type 
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phoneNumber: value }));
  
    // inline validation
    if (!value) {
      setErrors(prev => ({ ...prev, phoneNumber: "Phone number is required." }));
    } else if (!PHONE_REGEX.test(value)) {
      setErrors(prev => ({ ...prev, phoneNumber: "Invalid phone number format." }));
    } else {
      setErrors(prev => ({ ...prev, phoneNumber: "" }));
    }
  };
  
  const updatePhoneNumber = async () => {
      // final check
      if (!formData.phoneNumber) {
        setErrors(prev => ({ ...prev, phoneNumber: "Phone number is required." }));
        return;
      }
      if (errors.phoneNumber) {
        return; // don’t submit if invalid
      }
    setLoading(true);
    const mutation = `
      mutation {
        updateUser(
          id: "${user.id}",
          phone: "${formData.phoneNumber}"
        ) {
          id
          phone
        }
      }
    `;
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation }),
      });
      const json = await response.json();
      if (json.data && json.data.updateUser) {
        alert("Phone number updated successfully.");
        login({ ...user, phone: json.data.updateUser.phone });
        setEditingPhone(false);
      } else {
        alert("Failed to update phone number.");
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      alert("An error occurred while updating the phone number.");
    } finally {
      setLoading(false);
    }
  };




  // --- Shipping Addresses ---
  
  
  
  const handleShippingFieldChange = (index, field, value) => {
    setFormData(prev => {
      const addrs = [...prev.shippingAddresses];
      addrs[index] = {
        ...addrs[index],
        [field]: field === "zip" ? value.replace(/\D/g, "") : value  // keep only digits
      };
      return { ...prev, shippingAddresses: addrs };
    });
  };
  
  const addShippingAddress = () => {
    setFormData(prev => ({
      ...prev,
      shippingAddresses: [
        ...prev.shippingAddresses,
        { type: "", street: "", city: "", state: "", zip: "", country: "" },
      ],
    }));
    setEditingShippingIndex(formData.shippingAddresses.length);
  };
  
  // 1) Pull current list out of state and filter it
  const removeShippingAddress = async (index) => {
  // compute new array
  const newList = formData.shippingAddresses.filter((_, i) => i !== index);

  // 2) Persist that new array
  await updateShippingAddresses(newList);

  // 3) Update local state & primary index
  setFormData(prev => ({ 
    ...prev, 
    shippingAddresses: newList 
  }));
  if (primaryShippingIndex === index) {
    setPrimaryShippingIndex(null);
  } else if (primaryShippingIndex > index) {
    setPrimaryShippingIndex(primaryShippingIndex - 1);
  }
};
  
const updateShippingAddresses = async (addressesParam) => {
    setLoading(true);
  
    const mutation = `
      mutation UpdateUserShipping(
        $id: ID!
        $shipping: [AddressInput!]!
        $primaryShippingIndex: Int!
      ) {
        updateUser(
          id: $id
          shipping: $shipping
          primaryShippingIndex: $primaryShippingIndex
        ) {
          id
          shipping { type street city state zip country }
          primaryShippingIndex
        }
      }
    `;
  
    // Pick either the passed‑in list or the latest state
    const addresses = addressesParam ?? formData.shippingAddresses;
    // Clean out __typename and coerce zip to an integer
    const shippingPayload = addresses.map(addr => {
      const cleanAddr = omitDeep(addr, "__typename");
      return {
        ...cleanAddr,
        zip: Number(cleanAddr.zip),
      };
    });
  
    const variables = {
      id: user.id,
      shipping: shippingPayload,
      primaryShippingIndex: primaryShippingIndex ?? 0,
    };
    console.log("▶️ GQL Request:", { query: mutation, variables });
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });
      const json = await response.json();
  
      if (json.data?.updateUser) {
        alert("Shipping addresses updated successfully.");
        // 2. Update your context via login()
        login({
          ...user,
          shipping: json.data.updateUser.shipping,
          primaryShippingIndex: json.data.updateUser.primaryShippingIndex,
        });
        setEditingShippingIndex(null);
      } else if (json.errors) {
        console.error("GraphQL errors:", json.errors);
        alert("Failed to update shipping addresses: " + json.errors[0].message);
      } else {
        alert("Failed to update shipping addresses.");
      }
    } catch (error) {
      console.error("Error updating shipping addresses:", error);
      alert("An error occurred while updating shipping addresses.");
    } finally {
      setLoading(false);
    }
  };




  // --- Billing Addresses ---
  
  // 1) Handle field edits (keep only digits in ZIP)
const handleBillingFieldChange = (index, field, value) => {
  setFormData(prev => {
    const addrs = [...prev.billingAddresses];
    addrs[index] = {
      ...addrs[index],
      [field]: field === "zip" ? value.replace(/\D/g, "") : value
    };
    return { ...prev, billingAddresses: addrs };
  });
};

// 2) Add a new blank billing address and enter edit mode
const addBillingAddress = () => {
  setFormData(prev => ({
    ...prev,
    billingAddresses: [
      ...prev.billingAddresses,
      { type: "", street: "", city: "", state: "", zip: "", country: "" },
    ],
  }));
  setEditingBillingIndex(formData.billingAddresses.length);
};

// 3) Remove + persist billing address
const removeBillingAddress = async (index) => {
  const newList = formData.billingAddresses.filter((_, i) => i !== index);

  // Persist the change
  await updateBillingAddresses(newList);

  // Update local state & adjust primary index
  setFormData(prev => ({ ...prev, billingAddresses: newList }));
  if (primaryBillingIndex === index) {
    setPrimaryBillingIndex(null);
  } else if (primaryBillingIndex > index) {
    setPrimaryBillingIndex(primaryBillingIndex - 1);
  }
};

// 4) Persist billing addresses to the server
const updateBillingAddresses = async (addressesParam) => {
  setLoading(true);
  try {
    // a) Decide which list to send
    const addresses = addressesParam ?? formData.billingAddresses;

    // b) Clean out client‑only fields & coerce zip → Int
    const billingPayload = addresses.map(addr => {
      const clean = omitDeep(addr, "__typename", "id", "createdAt", "updatedAt");
      return { ...clean, zip: Number(clean.zip) };
    });

    // c) Ensure a non‑null primary index
    const primaryIndex =
      primaryBillingIndex != null
        ? primaryBillingIndex
        : addresses.length > 0
          ? 0
          : 0;

    // d) Build mutation + variables
    const mutation = `
      mutation UpdateUserBilling(
        $id: ID!,
        $billing: [AddressInput!]!,
        $primaryBillingIndex: Int!
      ) {
        updateUser(
          id: $id,
          billing: $billing,
          primaryBillingIndex: $primaryBillingIndex
        ) {
          id
          billing { type street city state zip country }
          primaryBillingIndex
        }
      }
    `;
    const variables = {
      id: user.id,
      billing: billingPayload,
      primaryBillingIndex: primaryIndex,
    };

    // e) Fire the request
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables }),
    });

    // f) Network‑error guard
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Network error ${response.status}: ${text}`);
    }

    // g) Parse & handle GraphQL errors
    const { data, errors } = await response.json();
    if (errors && errors.length) {
      throw new Error(errors.map(e => e.message).join("; "));
    }

    // h) On success, update context/UI
    login({
      ...user,
      billing: data.updateUser.billing,
      primaryBillingIndex: data.updateUser.primaryBillingIndex,
    });
    alert("Billing addresses updated successfully.");
    setEditingBillingIndex(null);

  } catch (error) {
    console.error("Error updating billing addresses:", error);
    alert(`Failed to update billing addresses: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
  
  // const handleBillingFieldChange = (index, field, value) => {
  //   setFormData((prev) => {
  //     const addrs = [...prev.billingAddresses];
  //     addrs[index] = { ...addrs[index], [field]: value };
  //     return { ...prev, billingAddresses: addrs };
  //   });
  // };

  // const addBillingAddress = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     billingAddresses: [
  //       ...prev.billingAddresses,
  //       { type: "", street: "", city: "", state: "", zip: "", country: "" },
  //     ],
  //   }));
  //   setEditingBillingIndex(formData.billingAddresses.length);
  // };
  
  // // Remove + persist billing address
  // const removeBillingAddress = async (index) => {
  //   const newList = formData.billingAddresses.filter((_, i) => i !== index);
  //   await updateBillingAddresses(newList);
  //   setFormData(prev => ({ ...prev, billingAddresses: newList }));
  //   if (primaryBillingIndex === index) {
  //     setPrimaryBillingIndex(null);
  //   } else if (primaryBillingIndex > index) {
  //     setPrimaryBillingIndex(primaryBillingIndex - 1);
  //   }
  // };

  // const updateBillingAddresses = async (addressesParam) => {
  //   setLoading(true);
  //   try {
  //     // 1) Clean & coerce your billing payload
  //     const addresses = addressesParam ?? formData.billingAddresses;
  //     const billingPayload = addresses.map(addr => {
  //       const { __typename, id, createdAt, updatedAt, ...clean } = addr;
  //       return {
  //         ...clean,
  //         zip: Number(clean.zip),  // ensure Int
  //       };
  //     });
  
  //     // 2) Figure out a non‐null primary index
  //     //    - if the user has explicitly picked one, use it
  //     //    - otherwise default to 0
  //     const primaryIndex =
  //       primaryBillingIndex != null
  //         ? primaryBillingIndex
  //         : addresses.length > 0
  //           ? 0
  //           : 0;  // you could also choose -1 or skip the field if your schema allowed
  
  //     // 3) Prepare mutation + variables
  //     const mutation = `
  //       mutation UpdateUserBilling(
  //         $id: ID!,
  //         $billing: [AddressInput!]!,
  //         $primaryBillingIndex: Int!
  //       ) {
  //         updateUser(
  //           id: $id,
  //           billing: $billing,
  //           primaryBillingIndex: $primaryBillingIndex
  //         ) {
  //           id
  //           billing { type street city state zip country }
  //           primaryBillingIndex
  //         }
  //       }
  //     `;
  //     const variables = {
  //       id: user.id,
  //       billing: billingPayload,
  //       primaryBillingIndex: primaryIndex
  //     };
  
  //     // 4) Send request
  //     const response = await fetch(GRAPHQL_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ query: mutation, variables })
  //     });
  
  //     // 5) Network‐error guard
  //     if (!response.ok) {
  //       const text = await response.text();
  //       throw new Error(`Network error ${response.status}: ${text}`);
  //     }
  
  //     // 6) Parse & handle GraphQL errors
  //     const { data, errors } = await response.json();
  //     if (errors && errors.length) {
  //       throw new Error(errors.map(e => e.message).join("; "));
  //     }
  
  //     // 7) On success, update context/UI
  //     login({
  //       ...user,
  //       billing: data.updateUser.billing,
  //       primaryBillingIndex: data.updateUser.primaryBillingIndex
  //     });
  //     alert("Billing addresses updated successfully.");
  //     setEditingBillingIndex(null);
  
  //   } catch (error) {
  //     console.error("Error updating billing addresses:", error);
  //     alert(`Failed to update billing addresses: ${error.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  // // const updateBillingAddresses = async (addressesParam) => {
  // //   setLoading(true);
  // //   try {
  // //     // 1. Build the clean payload
  // //     const addresses = addressesParam ?? formData.billingAddresses;
  // //     const billingPayload = addresses.map(addr => {
  // //       // strip out any client‐only fields
  // //       const { __typename, id, createdAt, updatedAt, ...clean } = addr;
  // //       return {
  // //         ...clean,
  // //         zip: Number(clean.zip)  // coerce ZIP to Int
  // //       };
  // //     });
  
  // //     // 2. Define your mutation & variables
  // //     const mutation = `
  // //       mutation UpdateUserBilling(
  // //         $id: ID!,
  // //         $billing: [AddressInput!]!,
  // //         $primaryBillingIndex: Int!
  // //       ) {
  // //         updateUser(
  // //           id: $id,
  // //           billing: $billing,
  // //           primaryBillingIndex: $primaryBillingIndex
  // //         ) {
  // //           id
  // //           billing { type street city state zip country }
  // //           primaryBillingIndex
  // //         }
  // //       }
  // //     `;
  // //     const variables = {
  // //       id: user.id,
  // //       billing: billingPayload,
  // //       primaryBillingIndex
  // //     };
  
  // //     // 3. Send the request
  // //     const response = await fetch(GRAPHQL_URL, {
  // //       method: "POST",
  // //       headers: { "Content-Type": "application/json" },
  // //       body: JSON.stringify({ query: mutation, variables })
  // //     });
  
  // //     // 4. Check for network errors
  // //     if (!response.ok) {
  // //       const text = await response.text();
  // //       throw new Error(`Network error: ${response.status} — ${text}`);
  // //     }
  
  // //     // 5. Parse & inspect GraphQL result
  // //     const { data, errors } = await response.json();
  // //     if (errors && errors.length) {
  // //       // combine all GraphQL error messages
  // //       const msg = errors.map(e => e.message).join("; ");
  // //       throw new Error(msg);
  // //     }
  
  // //     // 6. Success! Update your context & UI
  // //     login({
  // //       ...user,
  // //       billing: data.updateUser.billing,
  // //       primaryBillingIndex: data.updateUser.primaryBillingIndex
  // //     });
  // //     alert("Billing addresses updated successfully.");
  // //     setEditingBillingIndex(null);
  
  // //   } catch (error) {
  // //     console.error("Error updating billing addresses:", error);
  // //     alert(`Failed to update billing addresses: ${error.message}`);
  // //   } finally {
  // //     setLoading(false);
  // //   }
  // // };




  // --- Profile Picture ---
  
  
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // const uploadImage = async () => {
  //   if (!selectedFile) return formData.profilePictureUrl;
  //   const data = new FormData();
  //   data.append("file", selectedFile);
  //   try {
  //     const response = await fetch(UPLOAD_URL, {
  //       method: "POST",
  //       body: data,
  //     });
  //     return await response.text();
  //   } catch (error) {
  //     console.error("Image upload failed:", error);
  //     return null;
  //   }
  // };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    const data = new FormData();
    data.append("file", selectedFile);      // confirm your server expects "file"
    const res = await fetch(UPLOAD_URL, { method: "POST", body: data });
    const json = await res.json();           // parse JSON
    return json.url;                         // or json.path / json.filename
  };

  // const updateProfilePicture = async () => {
  //   setLoading(true);
  //   const profilePictureId = await uploadImage();
  //   const mutation = `
  //     mutation {
  //       updateUser(
  //         id: "${user.id}",
  //         profilePictureUrl: "${profilePictureId || formData.profilePictureUrl}"
  //       ) {
  //         id
  //         profilePictureUrl
  //       }
  //     }
  //   `;
  //   try {
  //     const response = await fetch(GRAPHQL_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ query: mutation }),
  //     });
  //     const json = await response.json();
  //     if (json.data && json.data.updateUser) {
  //       alert("Profile picture updated successfully.");
  //       login({
  //              ...user,
  //              profilePictureUrl: json.data.updateUser.profilePictureUrl
  //          });
  //     } else {
  //       alert("Failed to update profile picture.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating profile picture:", error);
  //     alert("An error occurred while updating your profile picture.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const updateProfilePicture = async () => {
    setLoading(true);
    try {
      const url = await uploadImage();
      if (!url) throw new Error("Image upload failed");
      const mutation = `
        mutation UpdateUserProfilePicture($id: ID!, $url: String!) {
          updateUser(id: $id, profilePictureUrl: $url) {
            id
            profilePictureUrl
          }
        }
      `;
      const variables = { id: user.id, url };
      const resp = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: mutation, variables }),
      });
      const { data, errors } = await resp.json();
      if (errors) throw new Error(errors[0].message);
      login({ ...user, profilePictureUrl: data.updateUser.profilePictureUrl });
      alert("Profile picture updated successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>My Profile</h2>
      <div style={styles.profileSection}>
        <div style={styles.infoSection}>
          {/* Read-only fields */}
          <div style={styles.field}>
            <label>Email:</label>
            <span style={styles.readOnly}>{user.email}</span>
          </div>
          <div style={styles.field}>
            <label>First Name:</label>
            <span style={styles.readOnly}>{user.firstName}</span>
          </div>
          <div style={styles.field}>
            <label>Last Name:</label>
            <span style={styles.readOnly}>{user.lastName}</span>
          </div>
          <div style={styles.field}>
            <label>Username:</label>
            <span style={styles.readOnly}>{user.username}</span>
          </div>
        </div>

        <div style={styles.formSection}>



         {/* Phone Number */}
<div style={styles.formGroup}>
  <label>Phone Number:</label>

  {editingPhone ? (
    <>
      <input
        type="tel"
        value={formData.phoneNumber}
        onChange={handlePhoneChange}
        style={styles.input}
        disabled={loading}
      />
      {errors.phoneNumber && (
        <div style={{ color: "red", fontSize: "0.8em", marginTop: 4 }}>
          {errors.phoneNumber}
        </div>
      )}
      <button
        onClick={updatePhoneNumber}
        style={styles.updateButton}
        disabled={loading || Boolean(errors.phoneNumber)}
      >
        {loading ? "Saving…" : "Update Phone"}
      </button>
    </>
  ) : (
    <>
      <span style={styles.readOnly}>
        {formData.phoneNumber}
      </span>
      <button
        onClick={() => setEditingPhone(true)}
        style={styles.editButton}
      >
        Edit
      </button>
    </>
  )}
</div>


          {/* Shipping Addresses */}
          <div style={styles.formGroup}>
            <label>Shipping Addresses:</label>
            {formData.shippingAddresses.map((addr, idx) => (
              <div key={idx} style={styles.addressRow}>
                <input
                  type="radio"
                  name="primaryShipping"
                  checked={primaryShippingIndex === idx}
                  onChange={() => setPrimaryShippingIndex(idx)}
                />
                {editingShippingIndex === idx ? (
                  <div style={styles.addressFormGroup}>
                    <div style={styles.addressField}>
                      <label>Type</label>
                      <input
                        placeholder="Type"
                        value={addr.type}
                        onChange={(e) => handleShippingFieldChange(idx, "type", e.target.value)}
                        style={styles.input}
                    />
                    </div>
                    <div style={styles.addressField}>
                      <label>Street</label>
                      <input
                        placeholder="Street"
                        value={addr.street}
                        onChange={(e) => handleShippingFieldChange(idx, "street", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>City</label>
                      <input
                        placeholder="City"
                        value={addr.city}
                        onChange={(e) => handleShippingFieldChange(idx, "city", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>State</label>
                      <input
                        placeholder="State"
                        value={addr.state}
                        onChange={(e) => handleShippingFieldChange(idx, "state", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>ZIP</label>
                      <input
                        placeholder="ZIP"
                        value={addr.zip}
                        onChange={(e) => handleShippingFieldChange(idx, "zip", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>Country</label>
                      <input
                        placeholder="Country"
                        value={addr.country}
                        onChange={(e) => handleShippingFieldChange(idx, "country", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingShippingIndex(null);
                        updateShippingAddresses();
                      }}
                      style={styles.updateButton}
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={styles.readOnly}>
                      {`${addr.type ? addr.type + ": " : ""}${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`}
                    </span>
                    <button
                      onClick={() => setEditingShippingIndex(idx)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeShippingAddress(idx)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
            <button onClick={addShippingAddress} style={styles.addButton}>
              Add Shipping Address
            </button>
          </div>

          {/* Billing Addresses */}
          <div style={styles.formGroup}>
            <label>Billing Addresses:</label>
            {formData.billingAddresses.map((addr, idx) => (
              <div key={idx} style={styles.addressRow}>
                <input
                  type="radio"
                  name="primaryBilling"
                  checked={primaryBillingIndex === idx}
                  onChange={() => setPrimaryBillingIndex(idx)}
                />
                {editingBillingIndex === idx ? (
                  <div style={styles.addressFormGroup}>
                    <div style={styles.addressField}>
                      <label>Type</label>
                      <input
                        placeholder="Type"
                        value={addr.type}
                        onChange={(e) => handleBillingFieldChange(idx, "type", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>Street</label>
                      <input
                        placeholder="Street"
                        value={addr.street}
                        onChange={(e) => handleBillingFieldChange(idx, "street", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>City</label>
                      <input
                        placeholder="City"
                        value={addr.city}
                        onChange={(e) => handleBillingFieldChange(idx, "city", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>State</label>
                      <input
                        placeholder="State"
                        value={addr.state}
                        onChange={(e) => handleBillingFieldChange(idx, "state", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>ZIP</label>
                      <input
                        placeholder="ZIP"
                        value={addr.zip}
                        onChange={(e) => handleBillingFieldChange(idx, "zip", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.addressField}>
                      <label>Country</label>
                      <input
                        placeholder="Country"
                        value={addr.country}
                        onChange={(e) => handleBillingFieldChange(idx, "country", e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingBillingIndex(null);
                        updateBillingAddresses();
                      }}
                      style={styles.updateButton}
                    >
                      Update
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={styles.readOnly}>
                      {`${addr.type ? addr.type + ": " : ""}${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}`}
                    </span>
                    <button
                      onClick={() => setEditingBillingIndex(idx)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeBillingAddress(idx)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
            <button onClick={addBillingAddress} style={styles.addButton}>
              Add Billing Address
            </button>
          </div>

          {/* Profile Picture */}
          <div style={styles.formGroup}>
            <label>Profile Picture:</label>
            {profilePicPreview && (
              <img
                src={profilePicPreview}
                alt="Profile Preview"
                style={styles.profileImage}
              />
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={updateProfilePicture} style={styles.updateButton}>
              Update Profile Picture
            </button>
          </div>
        </div>
      </div>
      <button onClick={() => navigate("/home")} style={styles.backButton}>
        Back to Home
      </button>
      {loading && (
        <div style={{ marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
          Saving changes...
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "0 auto" },
  profileSection: { display: "flex", gap: "20px", flexWrap: "wrap" },
  infoSection: {
    flex: "1 1 250px",
    borderRight: "1px solid #ccc",
    paddingRight: "20px",
  },
  field: { marginBottom: "10px" },
  readOnly: { marginLeft: "10px", fontWeight: "bold" },
  formSection: { flex: "2 1 400px" },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },

  formGroupInline: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },

  addressRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "5px",
    flexWrap: "nowrap",
    overflowX: "auto",
    width: "100%",
  },

  addressFormGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "15px",
  },

  addressField: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "8px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "100px",
    flex: "1 1 auto",
  },

  editButton: {
    padding: "5px 10px",
    fontSize: "14px",
    cursor: "pointer",
  },
  updateButton: {
    padding: "5px 10px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  },
  deleteButton: {
    padding: "5px 10px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
  },
  addButton: {
    padding: "5px 10px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    marginTop: "5px",
  },
  profileImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "50%",
    marginBottom: "10px",
  },
  backButton: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ProfileScreen;
