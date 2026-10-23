# Campus Found

Here is a conceptual framework and database architecture for building a Campus Lost and Found Web/Mobile Application customized to your specifications.

📱 1. Core User Interface Structure

The app should be divided into two main sections accessible via a bottom navigation bar or top tabs.

Section A: The Dashboard (Lost & Found Feed)

• Toggle Tabs: Switch seamlessly between Lost Items and Found Items.

• Search & Filter Bar: Search by item keywords (e.g., "iPhone 13") or filter by Category, Date, and Location.

• Item Listing Cards: Display cards for reported items featuring:

	• Item Name, Category icon, and Time elapsed (e.g., "2 hours ago").

	• Image thumbnail (if provided) and a brief description.

	• A "Share" button and a direct "Contact" button (links to WhatsApp or Dialer).

Section B: Report Missing Property (Form)

To keep reporting effortless for campus students, the submission form uses smart pre-selections:

1. Item Category (Quick Options): Simple buttons/chips for Wallet, Phone, Keys, ID Card, Laptop, and Other.

2. Item Name * (Text input: e.g., "Brown leather wallet")

3. Location/Hostel Area * (Dropdown + Text input field populated with common campus locations like "Near City Garden Hostel", "Main Library", "Dining Hall").

4. Date Picker * (Calendar modal to restrict entries to realistic timelines).

5. Description (Optional text area for distinguishing features).

6. Voice Description (Optional audio recording feature for quick reporting while on the move).

7. Contact Phone Number * (Numeric field pre-formatted for local carriers, e.g., 0779XXXXXX).

8. Photos & Files (Toggle between Select from Library or Take Photo Now using the device camera).

9. Submit Button

, make sure has notification ststem incase new items are uploaded or found.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f8af4be-2967-42e8-ab77-c6687942569e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
