# Orders → Google Sheets

Every order placed on the website becomes a row in a Google Sheet. EasyPaisa / JazzCash payment screenshots are saved to a Google Drive folder and linked from the row, and you get an email for each order. The [admin portal](#admin-portal) at `/admin` reads and updates the same sheet.

> **Already set up before the admin portal existed?** Go to [Updating the script for the admin portal](#updating-the-script-for-the-admin-portal).

```
Customer ──► /api/orders (the website's server)  ──►  Apps Script web app  ──►  "Orders" sheet row
             checks the details, re-prices the         checks the secret          screenshot in Drive
             bag from the catalogue, adds an order ID                             email to you
```

The secret means only your website can add orders to the sheet. Setup takes about 15 minutes.

## 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) (signed in to the Google account that should own the orders) and name the spreadsheet **ZED Orders**.
2. **File → Settings → Time zone**: choose **(GMT+05:00) Karachi**, then **Save settings**. Order dates use this time zone.

## 2. Add the script

1. In the sheet, open **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste in the contents of [`Code.gs`](Code.gs) from this folder.
3. Make a secret. In a terminal, run:

   ```bash
   openssl rand -hex 32
   ```

   Copy the output and paste it into the script in place of `PASTE_YOUR_SECRET_HERE`:

   ```js
   const SECRET = "3f9a…your 64 characters…c21e";
   ```

   Keep this value somewhere safe; the website needs the same one in step 5.
4. Click **Save** (the disk icon, or ⌘S). You can rename the project from "Untitled project" to **ZED Orders** at the top.

## 3. Run setup once

1. In the toolbar's function dropdown, choose **setup**, then click **Run**.
2. Google asks for permission:
   - **Review permissions**, then choose your account.
   - On "Google hasn't verified this app", click **Advanced → Go to ZED Orders (unsafe)**. This screen appears for every personal script; the script is your own and only touches this sheet, its Drive folder and your email.
   - Click **Allow**.
3. Check the results:
   - the sheet now has an **Orders** tab with bold headers and a Status dropdown;
   - your Google Drive has a folder called **ZED Orders - Payment Screenshots**.
4. Optional: choose **testOrder** and click **Run**. A `TEST-…` row appears and you get an email. Delete the row afterwards.

## 4. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: Website orders
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
4. Click **Deploy** and copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy…/exec`.
5. To check it, open that URL in a browser. You should see "ZED orders endpoint is running."

"Anyone" lets the website's server call the script without a Google sign-in. Requests without the right secret are rejected.

## 5. Connect the website

**On your computer (development):** create a file called `.env.local` in the project root (next to `package.json`). `.env.example` shows the format:

```bash
ORDERS_SCRIPT_URL=https://script.google.com/macros/s/AKfy…/exec
ORDERS_SCRIPT_SECRET=3f9a…the same secret as in Code.gs…c21e
```

Restart the dev server so it picks them up. `.env.local` is git-ignored, so the secret never reaches GitHub.

**On Netlify (the live site):**

1. Open the site in Netlify, then go to **Site configuration → Environment variables → Add a variable → Add a single variable**.
2. Add `ORDERS_SCRIPT_URL` with the web app URL. Repeat for `ORDERS_SCRIPT_SECRET` with the secret. If Netlify offers "Contains secret values", tick it for the secret.
3. Go to **Deploys → Trigger deploy → Deploy site**. Environment variables only apply to new deploys.

## 6. Test it end to end

1. On the site, add a perfume to the bag and click **Checkout**.
2. **Cash on Delivery:** fill in the details and place the order. A row appears with Status **New** and COD charges of 50.
3. **EasyPaisa / JazzCash:** place a second order and upload any image as the screenshot. Its row has Status **Verify payment**, and **View** in the Screenshot column opens the image.
4. Delete both test rows (and the test screenshot in the Drive folder).

## Admin portal

`/admin` on the website (e.g. `https://zed-fragrances.netlify.app/admin`) is a private page for handling orders. Nothing on the site links to it, search engines are told not to index it, and it needs a password.

**Set the password:** add `ADMIN_PASSWORD` next to the other two variables, in `.env` / `.env.local` and in Netlify, then restart the dev server or redeploy. Use something long, such as a passphrase of four or more words. A sign-in lasts 7 days on that device; changing the password signs every device out.

**What it does:**

- Lists every order, newest first, with filters (**Needs action** is the default: payments to verify and COD orders to confirm) and search by order ID, name, phone or city.
- Opening an order shows the payment screenshot, the customer (with Call and WhatsApp links), the address, the items and the totals.
- **Verify payment** orders: check the amount in your EasyPaisa / JazzCash app, then **Payment received, confirm**. **New** (COD) orders: confirm with the customer, then **Confirm order**. Either can be cancelled instead. Each change is written to the sheet straight away, and **Undo** puts it back.
- After confirming, **Send confirmation on WhatsApp** opens a chat with the customer and a prefilled message (wording in `src/config/admin.ts`).
- **Refresh** reloads the sheet, e.g. to see orders placed while the page was open.

Dispatched and Delivered are still set in the sheet; the portal shows them.

## Updating the script for the admin portal

The portal needs the newer `Code.gs` (it adds the actions that list orders, change a status and fetch a screenshot). New orders keep working the whole time.

1. In the sheet, open **Extensions → Apps Script**.
2. Copy your current `const SECRET = "…";` line somewhere safe.
3. Replace everything in `Code.gs` with the contents of [`Code.gs`](Code.gs) from this folder, then put your `SECRET` line back.
4. **Save**, then **Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy**. The URL stays the same.
5. Add `ADMIN_PASSWORD` (see [Admin portal](#admin-portal)) and redeploy the site.
6. Open `/admin`, sign in and check that your orders appear.

## Handling orders

Use the [admin portal](#admin-portal) day to day; the sheet works too:

- New orders are added at the bottom of the sheet. Use **Data → Create a filter** to sort or filter, e.g. to show only "Verify payment".
- **EasyPaisa / JazzCash:** open the screenshot and check that the amount and sender match a payment in your EasyPaisa or JazzCash app. Then set the Status to **Confirmed** and message the customer. The site tells them confirmation takes about 1 working day.
- **Cash on Delivery:** call or WhatsApp the customer to confirm, then set the Status to **Confirmed**.
- Move orders through **Dispatched** and **Delivered** (or **Cancelled**) as they progress.
- Don't rename the **Orders** tab or reorder its first 15 columns, because the script writes by position. You can add your own columns to the right (for example a tracking number).
- The sheet holds customers' names, phone numbers and addresses, so keep it private and don't share it by public link.

## Changing the script later

Saving the script does **not** update the live web app. After editing, publish a new version:

**Deploy → Manage deployments →** pencil icon **→ Version: New version → Deploy.**

The URL stays the same, so nothing changes on the website. (**New deployment** would create a new URL, and you would then have to update `ORDERS_SCRIPT_URL` everywhere.)

To turn off order emails, set `NOTIFY_BY_EMAIL = false` and publish a new version.

## Changing fees, the account or the wording

All on the website, in `src/config/brand.ts`:

- `checkout.deliveryFee` (150) and `checkout.codFee` (50);
- `checkout.wallet`: the providers shown, account number and account title;
- `copy.checkout`: every checkout text, including the confirmation messages.

## Troubleshooting

When an order fails, the customer sees "We couldn't place your order" with a link to send the same order on WhatsApp instead, so no order is lost. To find the cause:

- **Netlify:** the site's function logs (**Logs → Functions** in the site menu) show lines starting with `[orders]`. In development they appear in the dev server's terminal.
- **Apps Script → Executions** (clock icon on the left) shows every run of the script and its errors.

| What you see | Fix |
|---|---|
| `ORDERS_SCRIPT_URL or ORDERS_SCRIPT_SECRET is not set` | Add both variables (step 5) and trigger a new deploy, or restart the dev server. |
| `Apps Script answered 200: Unauthorized` | The secret in `Code.gs` and `ORDERS_SCRIPT_SECRET` differ. Make them identical, then publish a new script version. |
| `Apps Script answered …: not JSON` | "Who has access" isn't **Anyone**, or the URL isn't the `/exec` one from **Deploy → Manage deployments**. |
| A script change has no effect | Publish a new version (see "Changing the script later"). |
| No order emails | Check spam, check that `NOTIFY_BY_EMAIL` is `true`, and note the limit of 100 emails a day on a free account (orders are still saved). |
| `/admin` says "Sign-in is off" | `ADMIN_PASSWORD` isn't set where the site runs. Add it and redeploy (or restart the dev server). |
| `/admin` says "Couldn't load orders" with `no order list` or `Cannot read properties of undefined` | The script is the older version. Follow [Updating the script for the admin portal](#updating-the-script-for-the-admin-portal). |
| A screenshot says "Couldn't load the screenshot" | Its Drive file was deleted or moved to the trash, or the Screenshot cell's link was edited. |

The website shrinks screenshots before upload (to 2000px at most), so large phone screenshots work. Files that can't be read, or that are over 10 MB, are refused with a message.
