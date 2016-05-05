// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.ui.form.on("Customer", {
	before_load: function(frm) {
		frappe.setup_language_field(frm);
	},
	refresh: function(frm) {
		frm.dashboard.show_heatmap = true;
		frm.dashboard.heatmap_message = __('This is based on transactions against this Customer. See timeline below for details');
		frm.dashboard.show_dashboard();

		if(frappe.defaults.get_default("cust_master_name")!="Naming Series") {
			frm.toggle_display("naming_series", false);
		} else {
			erpnext.toggle_naming_series();
		}

		frm.toggle_display(['address_html','contact_html'], !frm.doc.__islocal);

		if(!frm.doc.__islocal) {
			erpnext.utils.render_address_and_contact(frm);
		} else {
			erpnext.utils.clear_address_and_contact(frm);
		}

		var grid = cur_frm.get_field("sales_team").grid;
		grid.set_column_disp("allocated_amount", false);
		grid.set_column_disp("incentives", false);

		frm.events.add_custom_buttons(frm);
	},
	add_custom_buttons: function(frm) {
		// ["Opportunity", "Quotation", "Sales Order", "Delivery Note", "Sales Invoice"].forEach(function(doctype, i) {
		// 	if(frappe.model.can_read(doctype)) {
		// 		frm.add_custom_button(__(doctype), function() {
		// 			frappe.route_options = {"customer": frm.doc.name};
		// 			frappe.set_route("List", doctype);
		// 		}, __("View"));
		// 	}
		// 	if(frappe.model.can_create(doctype)) {
		// 		frm.add_custom_button(__(doctype), function() {
		// 			frappe.route_options = {"customer": frm.doc.name};
		// 			new_doc(doctype);
		// 		}, __("Make"));
		// 	}
		// });
	},
	validate: function(frm) {
		if(frm.doc.lead_name) frappe.model.clear_doc("Lead", frm.doc.lead_name);
	}
});

cur_frm.cscript.onload = function(doc, dt, dn) {
	cur_frm.cscript.load_defaults(doc, dt, dn);
}

cur_frm.cscript.load_defaults = function(doc, dt, dn) {
	doc = locals[doc.doctype][doc.name];
	if(!(doc.__islocal && doc.lead_name)) { return; }

	var fields_to_refresh = frappe.model.set_default_values(doc);
	if(fields_to_refresh) { refresh_many(fields_to_refresh); }
}

cur_frm.add_fetch('lead_name', 'company_name', 'customer_name');
cur_frm.add_fetch('default_sales_partner','commission_rate','default_commission_rate');

cur_frm.fields_dict['customer_group'].get_query = function(doc, dt, dn) {
	return{
		filters:{'is_group': 'No'}
	}
}

cur_frm.fields_dict.lead_name.get_query = function(doc, cdt, cdn) {
	return{
		query: "erpnext.controllers.queries.lead_query"
	}
}

cur_frm.fields_dict['default_price_list'].get_query = function(doc, cdt, cdn) {
	return{
		filters:{'selling': 1}
	}
}

cur_frm.fields_dict['accounts'].grid.get_field('account').get_query = function(doc, cdt, cdn) {
	var d  = locals[cdt][cdn];
	var filters = {
		'account_type': 'Receivable',
		'company': d.company,
		"is_group": 0
	};

	if(doc.party_account_currency) {
		$.extend(filters, {"account_currency": doc.party_account_currency});
	}

	return {
		filters: filters
	}
}
