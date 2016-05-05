// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt
frappe.provide("erpnext");
frappe.provide("erpnext.utils");

$.extend(erpnext, {
	get_currency: function(company) {
		if(!company && cur_frm)
			company = cur_frm.doc.company;
		if(company)
			return frappe.get_doc(":Company", company).default_currency || frappe.boot.sysdefaults.currency;
		else
			return frappe.boot.sysdefaults.currency;
	},

	toggle_naming_series: function() {
		if(cur_frm.fields_dict.naming_series) {
			cur_frm.toggle_display("naming_series", cur_frm.doc.__islocal?true:false);
		}
	},

	hide_company: function() {
		if(cur_frm.fields_dict.company) {
			var companies = Object.keys(locals[":Company"] || {});
			if(companies.length === 1) {
				if(!cur_frm.doc.company) cur_frm.set_value("company", companies[0]);
				cur_frm.toggle_display("company", false);
			} else if(erpnext.last_selected_company) {
				if(!cur_frm.doc.company) cur_frm.set_value("company", erpnext.last_selected_company);
			}
		}
	},

	setup_serial_no: function() {
		var grid_row = cur_frm.open_grid_row();
		if(!grid_row.fields_dict.serial_no ||
			grid_row.fields_dict.serial_no.get_status()!=="Write") return;

		var $btn = $('<button class="btn btn-sm btn-default">'+__("Add Serial No")+'</button>')
			.appendTo($("<div>")
				.css({"margin-bottom": "10px", "margin-top": "10px"})
				.appendTo(grid_row.fields_dict.serial_no.$wrapper));

		$btn.on("click", function() {
			var d = new frappe.ui.Dialog({
				title: __("Add Serial No"),
				fields: [
					{
						"fieldtype": "Link",
						"options": "Serial No",
						"label": __("Serial No"),
						"get_query": function () {
							return {
								filters: {
									item_code:grid_row.doc.item_code ,
									warehouse:cur_frm.doc.is_return ? null : grid_row.doc.warehouse
								}
							}
						}
					},
					{
						"fieldtype": "Button",
						"label": __("Add")
					}
				]
			});

			d.get_input("add").on("click", function() {
				var serial_no = d.get_value("serial_no");
				if(serial_no) {
					var val = (grid_row.doc.serial_no || "").split("\n").concat([serial_no]).join("\n");
					grid_row.fields_dict.serial_no.set_model_value(val.trim());
				}
				d.hide();
				return false;
			});

			d.show();
		});
	}
});


$.extend(erpnext.utils, {
	clear_address_and_contact: function(frm) {
		$(frm.fields_dict['address_html'].wrapper).html("");
		frm.fields_dict['contact_html'] && $(frm.fields_dict['contact_html'].wrapper).html("");
	},

	render_address_and_contact: function(frm) {
		// render address
		$(frm.fields_dict['address_html'].wrapper)
			.html(frappe.render_template("address_list",
				cur_frm.doc.__onload))
			.find(".btn-address").on("click", function() {
				new_doc("Address");
			});

		// render contact
		if(frm.fields_dict['contact_html']) {
			$(frm.fields_dict['contact_html'].wrapper)
				.html(frappe.render_template("contact_list",
					cur_frm.doc.__onload))
				.find(".btn-contact").on("click", function() {
					new_doc("Contact");
				}
			);
		}
	},

	copy_value_in_all_row: function(doc, dt, dn, table_fieldname, fieldname) {
		var d = locals[dt][dn];
		if(d[fieldname]){
			var cl = doc[table_fieldname] || [];
			for(var i = 0; i < cl.length; i++) {
				if(!cl[i][fieldname]) cl[i][fieldname] = d[fieldname];
			}
		}
		refresh_field(table_fieldname);
	}
});

// add description on posting time
$(document).on('app_ready', function() {
	if(!frappe.datetime.is_timezone_same()) {
		$.each(["Stock Reconciliation", "Stock Entry", "Stock Ledger Entry",
			"Delivery Note", "Purchase Receipt", "Sales Invoice"], function(i, d) {
			frappe.ui.form.on(d, "onload", function(frm) {
				cur_frm.set_df_property("posting_time", "description",
					sys_defaults.time_zone);
			});
		});
	}
});